"""Run one Bol agent configuration through Gnani STT/TTS and Pipecat WebRTC."""

import json
import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from loguru import logger
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.frames.frames import (
    Frame,
    LLMContextFrame,
    LLMMessagesAppendFrame,
    TTSAudioRawFrame,
    TTSStartedFrame,
    TTSStoppedFrame,
    TTSTextFrame,
)
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMAssistantAggregatorParams,
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.utils.context.llm_context_summarization import LLMAutoContextSummarizationConfig
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.runner.types import RunnerArguments
from pipecat.runner.utils import create_transport
from pipecat.services.groq.llm import GroqLLMService
import aiohttp
from pipecat.transcriptions.language import Language
from pipecat.transports.base_transport import BaseTransport, TransportParams
from pipecat_gnani import GnaniSSETTSService, GnaniSTTService, GnaniTTSService
import tiktoken

RUNTIME_DIR = Path(__file__).resolve().parent
MAX_KNOWLEDGE_CHARS = 20_000
MAX_INPUT_TOKENS = 120_000
RESPONSE_RESERVE_TOKENS = 8_192
TOKENIZER = tiktoken.get_encoding("o200k_harmony")


def token_count(text: str) -> int:
    return len(TOKENIZER.encode(text, disallowed_special=()))

load_dotenv(RUNTIME_DIR / ".env", override=False)

transport_params = {
    "webrtc": lambda: TransportParams(audio_in_enabled=True, audio_out_enabled=True),
}


def load_agent_config() -> dict[str, Any]:
    config_path = Path(os.environ.get("BOL_AGENT_CONFIG", RUNTIME_DIR / "agent.json"))
    try:
        config = json.loads(config_path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValueError(f"Agent config not found: {config_path}") from exc
    except json.JSONDecodeError as exc:
        raise ValueError(f"Agent config is not valid JSON: {exc}") from exc

    if not isinstance(config, dict):
        raise ValueError("Agent config must be a JSON object.")

    for field in ("name", "language", "greeting", "instructions", "voice", "model"):
        if not isinstance(config.get(field), str) or not config[field].strip():
            raise ValueError(f"Agent config requires a non-empty '{field}' string.")

    try:
        config["language_value"] = Language[config["language"].upper().replace("-", "_")]
    except KeyError as exc:
        raise ValueError(
            f"Unsupported language '{config['language']}'. Use a Gnani language such as en-IN or hi-IN."
        ) from exc

    knowledge = config.get("knowledge", "")
    if not isinstance(knowledge, str):
        raise ValueError("Agent config field 'knowledge' must be text.")
    if len(knowledge) > MAX_KNOWLEDGE_CHARS:
        raise ValueError(
            f"Knowledge is too large for this first runtime slice ({MAX_KNOWLEDGE_CHARS} characters max)."
        )
    config["knowledge"] = knowledge.strip()
    if token_count(system_prompt(config)) > MAX_INPUT_TOKENS - RESPONSE_RESERVE_TOKENS:
        raise ValueError("Agent instructions and knowledge exceed the 120,000-token input budget. Shorten the draft and try again.")
    return config


def system_prompt(config: dict[str, Any]) -> str:
    template = (RUNTIME_DIR / "VOICE_AGENT_PROMPT.md").read_text(encoding="utf-8")
    instructions = config["instructions"]
    if config.get("greeting_mode") == "user_first":
        instructions += (
            f"\n\nFirst turn interaction: The caller speaks first to start the conversation. "
            f"When the caller speaks their first greeting or question, respond warmly to what they said, "
            f"introduce yourself with your configured greeting ('{config['greeting']}'), and assist them."
        )
    values = {
        "AGENT_NAME": config["name"],
        "LANGUAGE": config["language"],
        "AGENT_INSTRUCTIONS": instructions,
        "KNOWLEDGE": config["knowledge"] or "No custom knowledge has been provided.",
    }
    return re.sub(
        r"{{(AGENT_NAME|LANGUAGE|AGENT_INSTRUCTIONS|KNOWLEDGE)}}",
        lambda match: values[match.group(1)],
        template,
    )


async def run_bot(transport: BaseTransport, runner_args: RunnerArguments):
    config = load_agent_config()
    gnani_api_key = os.environ.get("GNANI_API_KEY")
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not gnani_api_key:
        raise RuntimeError("Set GNANI_API_KEY in voice_runtime/.env before starting the voice runtime.")
    if not groq_api_key:
        raise RuntimeError("Set GROQ_API_KEY in voice_runtime/.env before starting the voice runtime.")

    async with aiohttp.ClientSession() as session:
        language = config["language_value"]
        stt = GnaniSTTService(
            api_key=gnani_api_key,
            sample_rate=16000,
            settings=GnaniSTTService.Settings(language=language),
        )
        tts = GnaniSSETTSService(
            api_key=gnani_api_key,
            aiohttp_session=session,
            sample_rate=16000,
            settings=GnaniSSETTSService.Settings(voice=config["voice"], language=language),
        )
        llm = GroqLLMService(
            api_key=groq_api_key,
            settings=GroqLLMService.Settings(
                model=config["model"],
                system_instruction=system_prompt(config),
            ),
        )

        context = LLMContext()
        system_tokens = token_count(system_prompt(config))

        class PromptBudgetGuard(FrameProcessor):
            async def process_frame(self, frame: Frame, direction: FrameDirection):
                await super().process_frame(frame, direction)
                if isinstance(frame, LLMContextFrame):
                    messages = frame.context.get_messages()
                    budget = MAX_INPUT_TOKENS - RESPONSE_RESERVE_TOKENS - system_tokens
                    def count(items):
                        return token_count(json.dumps(items, ensure_ascii=False, default=str))
                    while count(messages) > budget and len(messages) > 4:
                        messages = messages[1:]
                        if messages and messages[0].get("role") == "assistant":
                            messages = messages[1:]
                    if count(messages) > budget:
                        raise ValueError("This conversation turn is too large for the model context. Please ask a shorter question.")
                    frame.context.set_messages(messages)
                await self.push_frame(frame, direction)

        class TTSOutputDiagnostics(FrameProcessor):
            def __init__(self):
                super().__init__()
                self.audio = {}

            async def process_frame(self, frame: Frame, direction: FrameDirection):
                await super().process_frame(frame, direction)
                if isinstance(frame, TTSStartedFrame):
                    context_id = frame.context_id or "unknown"
                    self.audio[context_id] = [0, 0]
                    logger.info("TTS started: context={}", context_id)
                elif isinstance(frame, TTSTextFrame):
                    logger.info(
                        "TTS text segment: context={} chars={}",
                        frame.context_id or "unknown",
                        len(frame.text),
                    )
                elif isinstance(frame, TTSAudioRawFrame):
                    context_id = frame.context_id or "unknown"
                    stats = self.audio.setdefault(context_id, [0, 0])
                    stats[0] += 1
                    stats[1] += len(frame.audio)
                elif isinstance(frame, TTSStoppedFrame):
                    context_id = frame.context_id or "unknown"
                    chunks, audio_bytes = self.audio.pop(context_id, [0, 0])
                    logger.info(
                        "TTS finished: context={} audio_chunks={} audio_bytes={}",
                        context_id,
                        chunks,
                        audio_bytes,
                    )
                await self.push_frame(frame, direction)

        aggregators = LLMContextAggregatorPair(
            context,
            user_params=LLMUserAggregatorParams(vad_analyzer=SileroVADAnalyzer()),
            assistant_params=LLMAssistantAggregatorParams(
                enable_auto_context_summarization=True,
                auto_context_summarization_config=LLMAutoContextSummarizationConfig(
                    max_context_tokens=max(1_000, min(80_000, MAX_INPUT_TOKENS - RESPONSE_RESERVE_TOKENS - system_tokens)),
                ),
            ),
        )
        pipeline = Pipeline(
            [
                transport.input(),
                stt,
                aggregators.user(),
                PromptBudgetGuard(),
                llm,
                tts,
                TTSOutputDiagnostics(),
                transport.output(),
                aggregators.assistant(),
            ]
        )
        task = PipelineTask(
            pipeline,
            params=PipelineParams(enable_metrics=True, enable_usage_metrics=True),
            idle_timeout_secs=runner_args.pipeline_idle_timeout_secs,
        )

        @transport.event_handler("on_client_connected")
        async def on_client_connected(transport, client):
            greeting_mode = config.get("greeting_mode", "agent_first")
            logger.info("{} connected (interaction_mode={})", config["name"], greeting_mode)
            if greeting_mode != "user_first":
                await task.queue_frames(
                    [
                        LLMMessagesAppendFrame(
                            messages=[
                                {
                                    "role": "user",
                                    "content": f"Start the conversation by saying this greeting exactly: {config['greeting']}",
                                }
                            ],
                            run_llm=True,
                        )
                    ]
                )
            else:
                logger.info("User-first mode: waiting for caller speech before greeting.")

        @transport.event_handler("on_client_disconnected")
        async def on_client_disconnected(transport, client):
            await task.cancel()

        await PipelineRunner(handle_sigint=runner_args.handle_sigint).run(task)


async def bot(runner_args: RunnerArguments):
    transport = await create_transport(runner_args, transport_params)
    await run_bot(transport, runner_args)


if __name__ == "__main__":
    from pipecat.runner.run import main

    main()

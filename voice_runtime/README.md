# Bol voice runtime — Increment 1

This is the first config-driven runtime slice. It uses the Gnani/Pipecat example's WebRTC runner, but reads the agent's behavior from `agent.json` instead of hard-coded values. The current browser UI is Pipecat's local development playground; Bol's own editor and voice screen come in later increments.

## Requirements

- Python 3.11 or newer
- A Gnani API key and a Groq API key

## Run

From this directory, create a virtual environment and install the runtime dependencies:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Add the keys to `.env`, edit `agent.json`, then run:

```powershell
$env:PYTHONIOENCODING = "utf-8"
python agent.py -t webrtc
```

Open [http://localhost:7860/client](http://localhost:7860/client) and connect. To use another configuration file, set `BOL_AGENT_CONFIG` to its path before launching the runtime.

## Configuration

`agent.json` supports `name`, `language`, `greeting`, `instructions`, `voice`, `model`, and `knowledge`. The first slice supports a small pasted-text knowledge field (up to 20,000 characters), included in the runtime model context. It does not implement document ingestion, URLs, embeddings, or retrieval. Provider credentials belong in `.env`, never in this file.

Edit `VOICE_AGENT_PROMPT.md` to change shared voice behavior. Each saved agent adds its own purpose, language, personality, knowledge, and boundaries to that template. Runtime logs report TTS text-segment lengths and audio-frame totals without logging the spoken content, so a full transcript can be compared with the audio produced by Gnani.

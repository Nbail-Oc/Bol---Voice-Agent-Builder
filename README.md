# Bol

Bol is a local, no-code builder for browser voice agents. OpenCode helps prepare a draft, and the shared Gnani/Pipecat runtime runs saved agent configurations.

## Demo video

<!-- Add your video here -->

## Start locally

Requirements: Node.js 20.9+, OpenCode CLI v2.2.5, Python 3.11+, and a connected OpenCode model provider.

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. OpenCode runs locally on port 4096. Connect a web-search provider in OpenCode if you want public research while creating agents.

## Create and run agents

1. Open **Create an agent** and describe what it should do.
2. Answer any focused questions. OpenCode can research relevant public sources and preserves their titles and URLs.
3. Review the draft in chat, request corrections if needed, then click **Create agent**.
4. Open the saved agent to edit it, or click **Start voice** and allow browser microphone access.

Bol stores agent configurations in `.bol/bol.db` and seeds the existing tea-shop example as a demo agent on first launch. Saving a draft does not create an agent; the approval button does. One browser voice session can run at a time.

Knowledge accepts pasted text and curated public research up to 20,000 characters. This release excludes phone calls, document uploads, full RAG, bookings, payments, and other external actions.

## Voice credentials

Set `GNANI_API_KEY` and `GROQ_API_KEY` in `voice_runtime/.env` (copy `.env.example` if needed). Credentials stay local. Saved agents share the Pipecat/Gnani STT/TTS pipeline and use Groq `openai/gpt-oss-20b`.

## OpenCode integration

Project files under `.opencode/` define the `bol-builder` agent, the `voice-agent-creator` skill, and a narrow `save_agent_draft` tool. The builder cannot use shell or general file editing. Bol APIs include `/api/agents`, `/api/agents/:agentId`, `/api/agent-drafts`, and `/api/agents/:agentId/voice-session`.

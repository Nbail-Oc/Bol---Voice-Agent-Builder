<div align="center">
  <img src="public/LOGO.png" alt="Bol logo" width="112">
  <h1>Bol</h1>
  <p><strong>The no-code voice agent builder</strong></p>
  <p>Create an agent by talking to AI. Describe what you need, answer a few questions, and Bol builds it with you.<br>No code or technical knowledge required.</p>
  <p><strong>About 3 minutes to create a voice agent, on average. Start free.</strong></p>
  <p><a href="#run-locally">Start free</a> &nbsp;·&nbsp; <a href="output/pdf/bol-solution-pitch.pdf">Read the one-page pitch</a></p>
</div>

---

## Demo

<p align="center"><a href="https://github.com/user-attachments/assets/1ea4311a-2267-449d-8491-8404ae074132">Watch the Bol demo video</a></p>

![](https://github.com/user-attachments/assets/1ea4311a-2267-449d-8491-8404ae074132)

---

## Solution pitch

> **[One-page solution pitch (accessible PDF)](output/pdf/bol-solution-pitch.pdf)**
>
> [Read the accessible text version](docs/bol-solution-pitch.md)

---

## What you can build

| Capability | What Bol does |
|---|---|
| Conversational setup | Describe the agent you want. Bol asks focused questions and builds it through conversation. |
| Multiple languages | Choose a language or combine several in one agent. |
| Custom behavior | Set the greeting, voice, instructions, knowledge, and conversation style. |
| Knowledge | Add your own information or let Bol research the web and build a knowledge base. |
| Interruptions | Interrupt while the agent is speaking. It stops, listens, and responds. |

Bol saves agent configurations and chats on your computer. [OpenCode](https://opencode.ai) helps create agents, Gnani handles speech recognition and generation, and [Pipecat](https://www.pipecat.ai) connects the voice session to the runtime model.

---

## Run locally

### Prerequisites

- **Node.js** 20.9 or newer
- **OpenCode CLI** with a model provider configured. See the [OpenCode setup guide](https://opencode.ai/docs/).
- **Python** 3.11 or newer
- **Gnani** and **Groq** API keys for voice sessions

The default OpenCode model uses OpenRouter.

### 1. Install and start

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. The development script starts OpenCode and the app.

### 2. Enable voice sessions

In a second terminal:

```powershell
cd voice_runtime
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Add your `GNANI_API_KEY` and `GROQ_API_KEY` to `voice_runtime/.env`, then restart the app.

> Keep these keys private. Bol stores agent data on your computer, but OpenCode and the selected speech and model providers receive the prompts and context needed to respond.

---

## Project files

| Path | Contents |
|---|---|
| `.opencode/` | Bol builder, creation skill, and draft-saving tool |
| `app/`, `components/` | Next.js interface and API routes |
| `voice_runtime/` | Pipecat/Gnani voice runtime |
| `lib/` | Agent configuration, local storage, and OpenCode integration |

# Bol

Bol is the no-code voice agent builder. Create an agent by talking to AI: describe what you need, answer a few questions, and Bol builds it with you. No code or technical knowledge required.

Create a voice agent in about three minutes on average. Start free.

## Demo

[Watch the Bol demo video](https://github.com/user-attachments/assets/1ea4311a-2267-449d-8491-8404ae074132), or use the player below.

![](https://github.com/user-attachments/assets/1ea4311a-2267-449d-8491-8404ae074132)

## Solution pitch

- [One-page solution pitch (accessible PDF)](output/pdf/bol-solution-pitch.pdf)
- [Accessible text version](docs/bol-solution-pitch.md)

GitHub opens the PDF as a rendered document. The Markdown link provides the same pitch as readable page text.

## What you can build

- Create a voice agent in a conversation, without writing code or prompts.
- Choose one language or combine multiple languages in one agent.
- Set custom instructions, a greeting, voice, knowledge, and conversation style.
- Give the agent your knowledge, or let it do deep web research and build a knowledge base.
- Interrupt the agent while it is speaking. It stops, listens, and responds.

Bol saves agent configurations and chats on your computer. OpenCode helps create agents. Gnani handles speech recognition and speech generation, and Pipecat connects the voice session to the runtime model.

## Run locally

To run the project, you need Node.js 20.9 or newer, the OpenCode CLI with a model provider configured, and Python 3.11 or newer. Voice sessions need Gnani and Groq API keys. The default OpenCode model uses OpenRouter. See the [OpenCode setup guide](https://opencode.ai/docs/) to install the CLI and connect a provider.

Install and start the app:

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. The development script starts OpenCode and the app.

To enable voice sessions, install the Python runtime in a second terminal:

```powershell
cd voice_runtime
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Add your `GNANI_API_KEY` and `GROQ_API_KEY` to `voice_runtime/.env`, then restart the app. Keep these keys private. Bol stores agent data on your computer, but OpenCode and the selected speech and model providers receive the prompts and context needed to respond.

## Project files

- `.opencode/` contains the Bol builder, its creation skill, and the draft-saving tool.
- `app/` and `components/` contain the Next.js interface and API routes.
- `voice_runtime/` contains the Pipecat/Gnani voice runtime.
- `lib/` contains agent configuration, local storage, and OpenCode integration.

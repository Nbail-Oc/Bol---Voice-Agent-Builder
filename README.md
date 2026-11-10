# Bol

Bol helps you turn a plain-language idea into a browser-based voice agent you can review, edit, and try. Describe the job, shape the agent with a conversational builder, then run the saved configuration through Gnani and Pipecat.

## Demo

[Watch the Bol demo video](https://github.com/user-attachments/assets/1ea4311a-2267-449d-8491-8404ae074132), or use the player below.

![](https://github.com/user-attachments/assets/1ea4311a-2267-449d-8491-8404ae074132)

## Solution pitch

- [Read the one-page solution pitch (PDF)](output/pdf/bol-solution-pitch.pdf)
- [Read the accessible text version](docs/bol-solution-pitch.md)

GitHub opens the PDF as a rendered document. The Markdown version provides the same pitch as page text for readers who prefer it or use assistive technology.

## What Bol does

- Turn a description into a draft agent with a role, tasks, language, greeting, boundaries, and conversation flow.
- Ask focused follow-up questions when an important detail is missing.
- Review and edit the draft before saving it as an agent.
- Add pasted knowledge or researched public information, then start a browser voice session.

Bol saves agent configurations and chat history locally. OpenCode helps create agents. Gnani handles speech recognition and speech generation, while Pipecat connects the browser voice session to the runtime model.

## Run locally

You need Node.js 20.9 or newer, the OpenCode CLI with a model provider configured, Python 3.11 or newer, and API keys for Gnani and Groq. The app uses OpenRouter for its default OpenCode model. See the [OpenCode setup guide](https://opencode.ai/docs/) to install the CLI and connect a provider.

Install the web app:

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. The development script starts the local OpenCode server and the web app.

To run voice agents, install the Python runtime in a second terminal:

```powershell
cd voice_runtime
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Add your `GNANI_API_KEY` and `GROQ_API_KEY` to `voice_runtime/.env`, then restart the app. Keep these keys private. The app stores agent data on your computer, but OpenCode and the selected speech and model providers receive the prompts and context needed to respond.

## Current scope

Each agent uses one configured language. Bol runs one browser voice session at a time. This build does not place phone calls or host agents online, and it does not support document uploads, bookings, or payments.

## Project files

- `.opencode/` contains the Bol builder, its creation skill, and the draft-saving tool.
- `app/` and `components/` contain the Next.js interface and API routes.
- `voice_runtime/` contains the Pipecat/Gnani voice runtime.
- `lib/` contains agent configuration, local storage, and OpenCode integration.

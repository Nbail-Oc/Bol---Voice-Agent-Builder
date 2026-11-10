# Bol: a voice agent you can shape in plain language

## The problem

Teams often know what they want callers to accomplish, but turning that need into clear agent instructions, trusted knowledge, speech settings, and a working voice pipeline takes technical setup.

## The solution

Bol lets a user describe the job in everyday language. Its OpenCode builder asks focused questions, drafts an agent for that use case, and presents the result for review before saving. Users can edit the agent, add knowledge, and try it in a browser voice session.

## How it works

1. Describe the callers and what they need help with.
2. Bol drafts the agent's role, tasks, language, greeting, boundaries, and conversation flow.
3. Review and edit the draft, then create the agent.
4. Start a browser voice session and try a real conversation.

Bol uses Gnani for speech recognition and speech generation, Pipecat for the WebRTC voice session, and Groq for the runtime model. Agent configurations and chat history stay on the user's computer. Prompts and relevant context are sent to the selected providers for processing.

## Who it is for

Bol is for organizations, services, and project teams that need a voice assistant for a defined workflow and want to shape its behavior before callers rely on it.

## What this build includes

- Conversational agent drafting with focused follow-up questions.
- Editable agent settings and a review step before creation.
- Pasted knowledge and researched public information.
- Browser-based voice sessions using the saved agent configuration.

## Current scope

This is a local developer preview. Setup requires Node.js, OpenCode, Python, and provider API keys. Each agent uses one configured language, and the app runs one voice session at a time. Bol does not place phone calls or host agents online. Document uploads, bookings, and payments are outside this build.

## Try it

Choose one real caller task, create an agent for it, and test a conversation in the browser. Review whether its answers are useful, grounded in the available knowledge, and clear when it cannot help.

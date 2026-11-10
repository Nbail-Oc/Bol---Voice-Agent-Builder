# Bol — Incremental Delivery Plan

**Document identifier:** BOL-PLAN-001  
**Version:** 2.0  
**Date:** 5 November 2026  
**Related specification:** [SRS.md](SRS.md)

## Product direction

Bol is a local-first, no-code voice-agent builder. A user describes an agent in chat, reviews a small set of settings, saves it, and starts a browser voice session. OpenCode helps create configurations; Bol validates and stores them. A reusable Bol runtime reads each configuration and runs it with Pipecat, Gnani STT/TTS, and a runtime LLM.

Pipecat is the voice-pipeline framework and `pipecat-gnani` supplies Gnani speech adapters. Neither package is Bol's agent builder or a ready-made RAG system. Bol owns agent configuration and persistence, knowledge sources and retrieval, the builder flow, and the user-facing experience.

## Delivery principles

- Prove the complete voice pipeline early, before building a large builder interface.
- Keep the first configuration small: name, language, greeting, instructions, voice, runtime model, and knowledge.
- Store a validated configuration, never generated Python code, for each agent.
- Start with pasted text as knowledge. Add document and URL ingestion, then retrieval, when the basic voice loop works.
- Keep provider credentials in the local runtime environment; never put them in browser code or agent JSON.
- Use Groq for the first runtime proof because the Gnani example already demonstrates it. Add OpenRouter as a compatible provider option afterward.
- Keep OpenCode for authoring only. A finished voice agent must run without an OpenCode session.
- Defer telephony, hosted agents, teams, cloud sync, and Electron packaging.

## Current foundation

The existing Next.js app has a landing page, an OpenCode chat UI, local chat/session persistence, and API routes that relay messages and events. Its Builder chat is still generic and cannot save Bol agents. The Gnani/Pipecat repository is cloned at `../pipecat-gnani`; its foundational example is a fixed WebRTC bot, not a Bol application.

## Increments

### Increment 0 — Local OpenCode chat foundation (existing)

**Outcome:** A local Next.js app can create OpenCode sessions and continue chats through server-side routes.

**Already present:** landing/chat pages, OpenCode startup script, session/message API routes, SSE events, and SQLite-backed chat records.

**Boundary:** This is useful Builder infrastructure, not the finished product or agent runtime. Do not spend time polishing generic chat before proving voice.

### Increment 1 — Config-driven Gnani/Pipecat runtime (created; live verification pending)

**Outcome:** One reusable Bol voice bot reads an agent configuration instead of relying on fixed values in the Gnani example.

**Scope:**

- Add a standalone Python runtime using `pipecat-gnani` and Pipecat's WebRTC runner.
- Read an `agent.json` containing name, language, greeting, instructions, TTS voice, and a small pasted-text knowledge field.
- Validate required values and supported language before opening provider connections.
- Feed instructions and the small knowledge text to the Groq runtime model; use Gnani WebSocket STT/TTS and Pipecat VAD/turn handling.
- Keep `GNANI_API_KEY` and `GROQ_API_KEY` in an ignored local `.env`; document setup and start commands.
- Keep the example's local Pipecat playground as the temporary voice UI. Bol's own agent editor and voice screen are later increments.

**Not included:** OpenCode-created settings, agent catalog, document ingestion, URLs, embeddings/vector storage, OpenRouter, integrated Bol UI, or production packaging.

**Acceptance:** With valid local keys, a developer can edit only `agent.json`, start the runtime, connect from the local browser playground, hear the configured greeting, speak in the configured language, get a knowledge-aware response, and interrupt playback. An invalid config fails with an actionable message before starting a call.

**Status:** Runtime template files are present. End-to-end provider behavior still needs a live run with credentials.

### Increment 2 — Saved agent records and a simple editor

**Outcome:** Bol users can create, list, open, edit, and delete multiple validated agent configurations without editing JSON.

**Scope:** Define one shared agent schema; persist records locally; build a basic form for the small set of fields; validate on the server; provide a clear create/edit/list flow. Runtime credentials remain separate from agent records.

**Acceptance:** Two agents with different instructions/languages can be saved, reloaded, edited, and deleted independently; invalid values are rejected; configuration survives app restart.

### Increment 3 — OpenCode agent builder and review-to-create flow

**Outcome:** Users can describe an agent in Bol chat, answer focused follow-ups, review a draft, and save it with **Create agent**.

**Scope:** Give OpenCode only Bol-specific validated tools for draft validation and agent create/read/update/list operations. Ask for missing details; show the proposed config and knowledge status before creation. Persist the Builder chat and link the created-agent card to the saved record.

**Acceptance:** A natural-language request results in a valid saved agent through the explicit review action; tool failures preserve the chat and draft; OpenCode cannot persist via arbitrary file or shell access.

### Increment 4 — Paste-in knowledge and source management

**Outcome:** Users can add, view, edit, and remove pasted knowledge associated with an agent.

**Scope:** Represent knowledge as separate source records with source type and attribution metadata. Make the contents available to the runtime using a bounded context for small collections. Show users that selected provider services receive relevant context.

**Acceptance:** A voice agent answers from its pasted source; source changes take effect in the next session; one agent cannot see another agent's knowledge.

### Increment 5 — Document and URL ingestion, then retrieval

**Outcome:** Knowledge can grow beyond a small prompt-sized text field while remaining attributable to its source.

**Scope:** Add a deliberately small supported document set and public URL extraction with clear size/type/error handling. Preserve source names and URLs. Add retrieval only when needed to select relevant excerpts for a turn; keep the retrieval layer behind Bol's knowledge interface.

**Acceptance:** Supported sources can be added and removed, relevant excerpts reach the runtime, source attribution is visible, and unrelated agent sources are excluded. Unsupported or unreadable input is reported without losing the agent.

### Increment 6 — Bol voice-session experience

**Outcome:** Users launch and use saved agents inside Bol rather than the Pipecat development playground.

**Scope:** Connect the Next.js UI to the local Pipecat runtime over WebRTC; build listening/processing/speaking/error states, transcript display, stop/end-session controls, and interruption behavior. Load the selected agent configuration for each session. Keep provider credentials on the local application/runtime side.

**Acceptance:** A user can start a saved agent from its detail page, have a hands-free conversation, interrupt speech, end the session, and recover from microphone/provider errors without losing saved data.

### Increment 7 — Provider setup, local security, and recovery

**Outcome:** The local app explains and manages the credentials and common failures needed for regular use.

**Scope:** Add setup/status flows for Gnani, Builder provider, and runtime provider; validate credentials; keep secrets out of source, agent JSON, and browser bundles; select appropriate local secure storage before non-developer distribution. Add privacy disclosures and practical recovery guidance.

**Acceptance:** Missing/invalid credentials, unavailable services, denied microphone access, and model failures have actionable recovery paths; failures do not corrupt agents or knowledge.

### Increment 8 — Release readiness and Electron packaging

**Outcome:** A non-developer can install Bol and use the local-first product without developer commands.

**Scope:** Confirm supported operating systems; manage Next.js, OpenCode, and Python runtime startup/shutdown; package the application; document data location, backups, provider requirements, and updates. Resolve signing and secure credential-store decisions.

**Acceptance:** A clean install can set up providers, create an agent, and run a voice session without manually starting developer services.

## Deferred after the initial local release (Future Scope)

As formalized in Section 3.9.2 of [SRS.md](SRS.md):
- **Telephony & Distribution:** Twilio/SIP inbound & outbound calling, embeddable WebRTC widget, WhatsApp/Telegram voice integration.
- **Business Tools & Actions:** Google Calendar/Cal.com appointment booking, CRM sync (HubSpot, Salesforce, Notion), post-call emails & payment link dispatch.
- **Model & Speech Providers:** Low-latency STT/TTS (Cartesia, Deepgram, ElevenLabs, Sarvam AI), offline local runtimes (Ollama/vLLM), and tiered multi-model routing.
- **Advanced Intelligence:** Mid-conversation code-switching/multilingual detection, live human hand-off, automated knowledge base synchronization.
- **Enterprise & Governance:** Call analytics & sentiment dashboards, automated PII redaction, team workspaces, and cloud synchronization.

## Increment completion rule

An increment is complete when its acceptance criteria can be demonstrated, its requirements remain consistent with [SRS.md](SRS.md), and the user has reviewed the result before the next increment begins. A dependency spike is not complete until its limitations and supported setup are documented.

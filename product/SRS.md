# Software Requirements Specification (SRS)

## Bol

**Document identifier:** BOL-SRS-001  
**Version:** 1.1  
**Date:** 4 November 2026  
**Status:** Product requirements baseline  
**Product delivery direction:** Next.js/React local web application first; Electron package later  
**Conformance basis:** Adapted to the SRS content outline in ISO/IEC/IEEE 29148:2018

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification defines the product scope, user-visible behavior, interfaces, constraints, and quality requirements for Bol. It is intended for the product owner, designers, developers, and reviewers who will plan and deliver the initial product release.

This document specifies what Bol must do. It does not select a database, framework, retrieval algorithm, audio implementation, or packaging tool unless stated as a product constraint.

### 1.2 Scope

Bol is a local-first Next.js/React web application that enables non-developers to create, configure, and run hands-free voice agents through a conversational interface. During the initial development and demonstration phase, the application runs locally with `npm run dev` and opens in a browser at localhost. Users describe an agent in natural language. A local OpenCode agent conducts the creation conversation, gathers missing details, prepares knowledge when needed, and invokes Bol-provided tools to save a complete agent configuration. The user reviews a summary and selects **Create agent** to finalize it. Electron packaging is deferred until the web application is complete and ready to distribute to non-developer users.

Bol uses Gnani speech-to-text (STT) and text-to-speech (TTS) for voice agents. Each finished voice agent uses a runtime language model from Groq or OpenRouter. OpenCode is used for agent creation only.

The initial release is a single-user local web application. It does not place telephone calls or host agents on a public service. It is not a hosted multi-user website.

### 1.3 Product overview

#### 1.3.1 Product perspective

Bol is a local Next.js/React application that coordinates local application data and external model services. It includes a chat interface for agent creation, an agent list and editor, local knowledge management, and a browser-based voice runtime. Provider requests use credentials supplied by the user. Electron may later package the completed app and its local services for simple end-user installation.

Bol is not Gnani's managed Agent Builder. Bol creates and runs its own agent configurations while using Gnani speech APIs. The hackathon brief in the project states that the managed Agent Builder is outside the challenge scope; Bol's planned use of Gnani STT/TTS provides its Gnani technology integration.

#### 1.3.2 Product functions

Bol provides the following major functions:

1. First-run setup for Gnani credentials and the OpenCode Builder model provider.
2. Chat-based creation of multiple voice agents, including follow-up questions and conditional public web research.
3. Knowledge input through pasted text, uploaded documents, public URLs, or researched public information.
4. Tool-based creation, local persistence, listing, editing, and deletion of agents.
5. Hands-free browser voice sessions using Gnani STT/TTS and Groq or OpenRouter for runtime responses.
6. Barge-in handling so user speech interrupts current agent audio playback.
7. Local settings for provider credentials and agent configuration.

#### 1.3.3 User characteristics

The primary user is a non-developer who can describe a task in ordinary language but does not want to configure a voice pipeline, write system prompts, or assemble technical workflows. Users may create several agents for different purposes and languages. Users may have varying familiarity with provider API keys and OAuth-based sign-in.

#### 1.3.4 Limitations

- The initial version requires a compatible development environment and an internet connection for external provider services.
- Gnani, OpenCode's selected Builder provider, and Groq/OpenRouter have separate authentication, availability, usage, and rate-limit behavior.
- Speech recognition and synthesis capabilities are constrained by the Gnani models, languages, voices, and API features available to the user.
- OpenCode's ability to research public websites depends on the web-search/page-fetch tools available in its local configuration.
- The initial release supports one configured language per agent; automatic mid-conversation language switching is excluded.
- Local application data stays on the user's computer, but prompts, relevant knowledge context, and audio/transcription data may be sent to selected external providers for processing.

### 1.4 Definitions, acronyms, and abbreviations

| Term | Definition |
|---|---|
| Agent | A locally saved configuration for a voice assistant, including purpose, language, instructions, greeting, voice, runtime model, and knowledge sources. |
| Barge-in | The behavior where user speech during agent playback stops the current playback and is processed as the next user turn. |
| Builder | The local OpenCode agent presented through Bol's creation chat. |
| Knowledge source | Text or content made available to a voice agent for answering questions. |
| LLM | Large language model. |
| STT | Speech-to-text. |
| TTS | Text-to-speech. |
| BYOK | Bring your own key; the user provides their provider credential. |
| VAD | Voice activity detection; detection of speech activity in an audio stream. |

## 2. References

| ID | Reference |
|---|---|
| REF-1 | ISO/IEC/IEEE 29148:2018, *Systems and software engineering — Life cycle processes — Requirements engineering*, active standard. [IEEE Standards Association](https://standards.ieee.org/ieee/29148/6937/) |
| REF-2 | Project hackathon brief, [`../hackathon_info/info.md`](../hackathon_info/info.md). |
| REF-3 | Gnani Speech API overview. https://docs.gnani.ai/api/introduction/introduction |
| REF-4 | Gnani real-time STT and VAD documentation. https://docs.gnani.ai/api/STT/stt-websocket |
| REF-5 | Gnani real-time TTS documentation. https://docs.gnani.ai/api/TTS/tts-websocket |
| REF-6 | OpenCode server documentation. https://docs.opencode.ai/docs/server/ |
| REF-7 | OpenCode tools and permissions documentation. https://docs.opencode.ai/docs/tools/ |
| REF-8 | OpenCode provider setup documentation. https://opencode.ai/docs/providers |
| REF-9 | Next.js and React overview. https://nextjs.org/learn/react-foundations/what-is-react-and-nextjs |
| REF-10 | Electron application packaging and distribution. https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging |

## 3. Requirements

Requirements use “shall” for mandatory behavior. “Should” indicates a recommended behavior that may be refined during design.

### 3.1 Functional requirements

#### 3.1.1 Installation and first-run setup

- **BOL-FR-001:** The initial version shall be a Next.js/React web application that runs locally in a browser.
- **BOL-FR-002:** During development and demonstration, the application shall be started with `npm run dev` and accessed at localhost.
- **BOL-FR-002a:** Electron packaging shall be deferred until the local web application is complete and ready for distribution to non-developer users.
- **BOL-FR-003:** The system shall open without requiring a Bol account or Bol sign-in.
- **BOL-FR-004:** The system shall start or connect to the local OpenCode service required for Builder conversations without requiring the user to manually start a separate service during normal use.
- **BOL-FR-005:** First-run setup shall collect and validate the user's Gnani credential for STT/TTS.
- **BOL-FR-006:** First-run setup shall connect a model provider for the OpenCode Builder. The setup shall explain the credential or provider-specific sign-in step required by the selected provider.
- **BOL-FR-007:** First-run setup shall allow the user to skip Groq/OpenRouter runtime credentials.
- **BOL-FR-008:** Before starting a voice agent without runtime credentials, the system shall prompt the user to configure Groq or OpenRouter.
- **BOL-FR-009:** The system shall provide settings to add, replace, validate, and remove provider credentials after setup.
- **BOL-FR-010:** The system shall show connection/setup status for Gnani, the OpenCode Builder service/provider, and the selected runtime provider.

#### 3.1.2 Conversational agent creation

- **BOL-FR-011:** The system shall provide a chat-first Builder interface with a new-chat action and a sidebar of prior creation chats.
- **BOL-FR-012:** A new creation chat shall provide a simple text prompt through which a user can describe a desired agent in natural language.
- **BOL-FR-013:** The Builder shall ask focused follow-up questions when required information is missing or ambiguous.
- **BOL-FR-014:** The Builder shall reuse relevant information already provided and shall avoid asking the user to repeat it.
- **BOL-FR-015:** The Builder shall gather sufficient details to configure, at minimum, the agent's name, purpose, intended users, language, greeting, instructions, task boundaries, runtime model/provider, and knowledge needs.
- **BOL-FR-016:** The Builder shall provide a review summary of the proposed agent before creation.
- **BOL-FR-017:** The review summary shall show, at minimum, the agent's name, purpose, language, greeting, instructions, selected voice, runtime model/provider, and knowledge-source status.
- **BOL-FR-018:** Selecting **Create agent** shall directly invoke the creation operation. The system shall not require an additional confirmation prompt.
- **BOL-FR-019:** After successful creation, the system shall display an agent-created card in the creation chat with a link to the saved agent.
- **BOL-FR-020:** If creation fails, the system shall explain the failure and preserve the creation conversation and recoverable draft information.

#### 3.1.3 Builder tools and agent lifecycle

- **BOL-FR-021:** The system shall provide application-specific tools to OpenCode for creating, reading, updating, listing, and deleting Bol agent records and managing their knowledge sources.
- **BOL-FR-022:** The system shall validate tool inputs before saving agent data.
- **BOL-FR-023:** The system shall save each created agent and its settings on the user's computer.
- **BOL-FR-024:** The system shall allow users to create and manage multiple agents.
- **BOL-FR-025:** The system shall provide an Agents view listing saved agents.
- **BOL-FR-026:** Selecting an agent card or list item shall open that agent's detail page.
- **BOL-FR-027:** The agent detail page shall allow the user to edit all agent settings after creation, including name, purpose, language, greeting, instructions, voice, runtime model/provider, and knowledge sources.
- **BOL-FR-028:** Changes to agent settings shall be saved locally and used by subsequent voice sessions.
- **BOL-FR-029:** The system shall allow users to delete an agent and its associated local configuration and knowledge after an explicit deletion confirmation.
- **BOL-FR-030:** When OpenCode creates or updates an agent, it shall use Bol's validated application tools rather than relying on free-form text output as the persistence mechanism.

#### 3.1.4 Knowledge management and public research

- **BOL-FR-031:** The system shall allow users to provide knowledge by pasting text.
- **BOL-FR-032:** The system shall allow users to upload documents as knowledge sources.
- **BOL-FR-033:** The system shall allow users to provide public URLs as knowledge sources.
- **BOL-FR-034:** OpenCode shall be able to read user-provided materials through Bol-provided tools and prepare them for association with an agent.
- **BOL-FR-035:** The Builder shall offer public research when relevant if the user has no custom knowledge or asks for public information.
- **BOL-FR-036:** Public research shall be conditional; the Builder shall not browse the web for every agent by default.
- **BOL-FR-037:** When public research is requested or appropriate, OpenCode may use its available web-search and page-fetch tools to gather relevant information and prepare a Markdown or text knowledge file.
- **BOL-FR-038:** When a source URL is available, the system should preserve it with the resulting knowledge content and show researched materials in the review summary.
- **BOL-FR-039:** The system shall associate each knowledge source with one or more agents and allow the user to edit or remove it.
- **BOL-FR-040:** The system shall distinguish user-provided instructions from source knowledge in its agent configuration and editing interface.

#### 3.1.5 Voice-agent runtime

- **BOL-FR-041:** The system shall run each saved agent as a hands-free voice experience in Bol's local application interface.
- **BOL-FR-042:** A voice session shall begin with the agent's configured spoken greeting.
- **BOL-FR-043:** The system shall send user speech to Gnani STT using the agent's configured language.
- **BOL-FR-044:** The system shall send the transcript, relevant conversation context, agent instructions, and retrieved knowledge to the agent's configured Groq or OpenRouter runtime model.
- **BOL-FR-045:** The system shall send the runtime model's text response to Gnani TTS using the agent's configured language and selected compatible voice.
- **BOL-FR-046:** The system shall support one configured language per agent in the initial release.
- **BOL-FR-047:** The initial release shall not require an agent to switch languages mid-conversation.
- **BOL-FR-048:** Agent instructions shall encourage concise spoken replies of approximately two to four short sentences in ordinary conversation, while allowing a longer response when the user requests elaboration.
- **BOL-FR-049:** The system shall support barge-in. When the user begins speaking during agent playback, the system shall stop current playback, discard pending audio chunks, and process the interruption as the next user turn.
- **BOL-FR-050:** The system shall provide a user action to end a voice session.
- **BOL-FR-051:** The system shall indicate when it is listening, processing speech, generating a response, speaking, or disconnected/error.
- **BOL-FR-052:** If the microphone, provider connection, or model request fails, the system shall provide an actionable error and a recovery path.

### 3.2 Performance requirements

- **BOL-PER-001:** The system should begin playback as soon as a useful TTS audio chunk is available rather than waiting for the complete response, where supported by the selected Gnani endpoint.
- **BOL-PER-002:** The system should stop audible playback promptly after detecting barge-in and shall not continue playing queued chunks after cancellation.
- **BOL-PER-003:** The system should show immediate visual acknowledgement of detected speech and provider-processing state.
- **BOL-PER-004:** Numeric latency targets for STT, runtime LLM, TTS, and interruption response remain to be established during technical design and prototyping.

### 3.3 Usability requirements

- **BOL-USA-001:** A user shall be able to create an agent without writing code, configuring a visual pipeline, or manually copying prompts between services.
- **BOL-USA-002:** The Builder shall use plain language for questions, setup guidance, and errors.
- **BOL-USA-003:** The agent review summary shall make the proposed behavior and knowledge sources understandable before creation.
- **BOL-USA-004:** The system shall provide editable controls for saved agent settings.
- **BOL-USA-005:** The voice interface shall display clear listening, speaking, and error states and provide an explicit way to end the session.
- **BOL-USA-006:** Provider setup shall distinguish the required Gnani and Builder credentials from the optional-until-runtime Groq/OpenRouter credential.

### 3.4 Interface requirements

#### 3.4.1 User interfaces

The system shall provide:

- A first-run setup flow and settings view for providers.
- A chat interface with creation history, new-chat action, and message composer.
- A review summary with **Create agent** action.
- An agent-created chat card.
- An Agents list and an agent detail/edit page.
- A hands-free voice-session interface with visible session state, playback interruption, and end-session control.
- Knowledge-source controls for pasted text, document upload, and public URLs.

Detailed visual design and layout are outside this SRS.

#### 3.4.2 Software interfaces

- Gnani speech-to-text API for real-time transcription.
- Gnani text-to-speech API for synthesized agent speech.
- OpenCode local server/API or SDK for Builder sessions and tool execution.
- A selected Groq or OpenRouter API for runtime text generation.
- Local system storage for agent records, Builder chats, knowledge sources, and settings.

Exact API versions, SDKs, schemas, and local persistence technology are implementation decisions.

#### 3.4.3 Communication interfaces

- Provider communication shall use the providers' supported secure network protocols.
- Local communication between Bol and OpenCode shall remain bound to the user's machine unless the user explicitly configures otherwise.
- The application process shall mediate provider connections where browser networking cannot safely or correctly provide required authentication headers.

### 3.5 Logical database requirements

The logical data store shall represent, at minimum:

- Provider configuration and credential references.
- Builder chats and messages.
- Agent records and editable configuration.
- Knowledge sources, source metadata, and agent associations.
- Voice-session metadata needed to operate the session.

The store shall support listing, retrieving, updating, and deleting agents and their associated knowledge. The physical schema, database engine, and retention policy are not specified here.

### 3.6 Design and implementation constraints

- **BOL-CON-001:** The initial implementation shall use Next.js/React and run locally in a browser.
- **BOL-CON-001a:** Electron packaging shall occur after the local web application is complete and is ready for end-user distribution.
- **BOL-CON-002:** Bol itself shall not require a hosted Bol account or Bol-operated server for the initial release.
- **BOL-CON-003:** OpenCode shall be used for agent creation only; Groq or OpenRouter shall be used for the finished agent's runtime responses.
- **BOL-CON-004:** Gnani shall provide STT/TTS for the voice-agent runtime.
- **BOL-CON-005:** Users shall supply their own provider credentials.
- **BOL-CON-006:** Agent settings, creation chats, and knowledge data shall be stored locally for the initial release.
- **BOL-CON-007:** The initial release shall use one configured language per agent.
- **BOL-CON-008:** The initial release shall not include telephony, public hosting, hosted embeds, or multi-user collaboration.
- **BOL-CON-009:** Gnani's browser WebSocket documentation states that required custom API-key headers cannot be set by a browser WebSocket. The implementation shall use an application process capable of attaching Gnani authentication headers and shall not expose provider keys to the renderer.
- **BOL-CON-010:** Gnani, OpenCode, Groq, and OpenRouter are external services; Bol cannot guarantee their availability, quotas, pricing, model catalog, or response quality.

### 3.7 Software system attributes

#### 3.7.1 Security and privacy

- **BOL-SEC-001:** Provider credentials shall not be committed to source control or exposed in browser-rendered client code.
- **BOL-SEC-002:** The system shall store credentials on the user's computer using an OS-appropriate secure storage mechanism selected during design.
- **BOL-SEC-003:** The system shall restrict the OpenCode Builder to the Bol-specific tools required for agent creation and knowledge management; unrelated filesystem and shell access shall be disabled or require explicit authorization in the shipped configuration.
- **BOL-SEC-004:** The system shall tell users that voice audio, transcripts, prompts, and relevant retrieved knowledge may be sent to the selected providers for processing.
- **BOL-SEC-005:** The initial release shall not send local agent data to Bol-hosted synchronization or analytics services.
- **BOL-SEC-006:** The system shall distinguish researched/public knowledge from user-authored instructions and preserve source attribution where available.

#### 3.7.2 Reliability and availability

- **BOL-REL-001:** A temporary provider failure shall not delete or corrupt saved agent configurations or knowledge.
- **BOL-REL-002:** The system shall support recovery from invalid credentials, unavailable OpenCode service, denied microphone access, and provider request failures.
- **BOL-REL-003:** The system shall not mark an agent as created unless its configuration has been successfully saved locally.

#### 3.7.3 Maintainability and portability

- **BOL-MNT-001:** Provider integration details shall be isolated so that model/API version changes can be handled without changing the user-visible agent concept.
- **BOL-MNT-002:** The release shall document supported operating systems, provider requirements, and user recovery steps.
- **BOL-PRT-001:** Development documentation shall describe prerequisite installation, starting the application with `npm run dev`, and opening it at localhost.
- **BOL-PRT-002:** Before distributing Bol to non-developer users, the later Electron package should manage required local services without requiring users to launch developer tools manually.

### 3.8 Verification

Each requirement in Section 3 shall be verified by inspection, analysis, demonstration, or test after the implementation plan is approved. Specific test cases, measurable latency targets, operating-system coverage, and acceptance thresholds shall be defined during technical planning. The acceptance scenarios in Section 3.1 and the requirements above provide the verification basis.

### 3.9 Supporting information

#### 3.9.1 Product boundary

The first release is complete when a user can:

1. Install development prerequisites, run `npm run dev`, and open Bol at localhost without creating a Bol account.
2. Configure Gnani and connect a Builder model provider.
3. Describe an agent in chat and answer follow-up questions.
4. Provide knowledge or request relevant public research.
5. Review a summary and click **Create agent**.
6. Open the created agent, edit its settings, and run it hands-free in one language.
7. Interrupt its spoken response by speaking and receive a response to the interruption.

#### 3.9.2 Deferred capabilities and future scope

While the initial release focuses on a local-first conversational voice-agent creator, the following features are defined as the post-MVP roadmap:

1. **Telephony & Real-World Distribution (Channels):**
   - **BOL-FUT-001 (Telephony & SIP Trunking):** Inbound and outbound phone number integration via Twilio, Vonage, or direct SIP trunking, allowing voice agents to receive standard telephone calls and run automated outbound campaigns.
   - **BOL-FUT-002 (Embeddable WebRTC Widget):** A drop-in client-side script tag or React component enabling webmasters to embed the hands-free voice experience on any public website or e-commerce storefront.
   - **BOL-FUT-003 (Social & Messaging Voice Integrations):** Two-way voice messaging and voice-note handling for messaging platforms including WhatsApp Business API and Telegram bots.

2. **Business Action Tools & MCP Integrations (Execution):**
   - **BOL-FUT-004 (Calendar & Appointment Scheduling):** Live scheduling integration with Google Calendar, Cal.com, and Calendly to check availability, book slots, and handle rescheduling during active voice conversations.
   - **BOL-FUT-005 (CRM Synchronization & Lead Capture):** Automatic synchronization of call transcripts, lead qualifications, action items, and metadata to CRMs such as HubSpot, Salesforce, Notion, and Airtable.
   - **BOL-FUT-006 (Post-Call Communication & Payments):** Automated post-call triggers to dispatch email confirmations via Gmail/Outlook, SMS follow-ups, and Stripe/Razorpay payment links generated during the conversation.

3. **Expanded Model, Speech & Hardware Providers (Extensibility):**
   - **BOL-FUT-007 (High-Performance Speech Providers):** Support for alternative high-speed STT/TTS providers including Cartesia (ultra-low-latency Sonic TTS), Deepgram (Nova-3 streaming STT), ElevenLabs (voice cloning and emotive speech), and Sarvam AI (specialized Indic regional languages).
   - **BOL-FUT-008 (On-Premise & Local Runtime LLMs):** Fully offline, air-gapped voice-agent execution using local LLM runtimes such as Ollama, llama.cpp, or vLLM for zero-cloud data privacy and compliance.
   - **BOL-FUT-009 (Tiered Multi-Model Orchestration):** Dynamic routing between lightweight ultra-fast models (e.g., Groq/Cerebras Llama-3 8B) for immediate conversational dialogue and heavier reasoning models (Claude, DeepSeek R1) for complex knowledge synthesis.

4. **Advanced Conversational Intelligence:**
   - **BOL-FUT-010 (Dynamic Code-Switching & Multilingual Detection):** Real-time mid-conversation language switching (e.g., fluid English-to-Hindi/Hinglish code-switching) without restarting session state.
   - **BOL-FUT-011 (Live Human Hand-Off & Escalation):** Real-time detection of user frustration, negative sentiment, or explicit escalation intent, triggering automated warm transfer to human telephone operators or support desks.
   - **BOL-FUT-012 (Automated Knowledge Synchronization):** Scheduled re-indexing and webhook-based live synchronization for dynamic knowledge sources (Google Drive, Notion workspaces, and public website sitemaps).

5. **Analytics, Safety & Enterprise Governance:**
   - **BOL-FUT-013 (Call Analytics & Sentiment Dashboard):** Visual reporting on call completion rates, average handle duration, interruption frequency, sentiment trends, and common user objections.
   - **BOL-FUT-014 (Automated PII Redaction & Secure Storage):** Real-time masking and redaction of personally identifiable information (credit card numbers, passwords, identification numbers) from voice transcripts and local database records.
   - **BOL-FUT-015 (Multi-User Workspaces & Cloud Sync):** Multi-tenant organization accounts, team collaboration, role-based access control (RBAC), and cloud backup synchronization across distributed devices.

#### 3.9.3 Assumptions and dependencies

- The user has a compatible computer, microphone, speaker/headphones, and internet connection.
- The user can obtain Gnani credentials and credentials or authorization for an OpenCode Builder model provider.
- The user can obtain Groq/OpenRouter credentials before running a finished voice agent.
- The required OpenCode web-search/page-fetch capabilities are available in the user's configuration when public research is requested.
- The exact OpenCode local-service startup and provider-authentication flow will be established during technical design.

#### 3.9.4 Open implementation decisions

- Next.js local server/API organization and how it coordinates with OpenCode and provider requests.
- Electron packaging, OpenCode bundling/download management, supported desktop operating systems, and application update mechanism for the later distribution phase.
- OpenCode SDK/API and exact application-tool schemas.
- Provider OAuth handoff and credential management details.
- Local database, file format, secure credential storage, and backup/export.
- Supported upload file types, file-size limits, and extraction behavior.
- Knowledge retrieval/indexing approach and multilingual quality requirements.
- Audio capture, echo cancellation, VAD thresholds, and barge-in sensitivity.
- Chat/session retention and whether voice audio is ever stored.
- Agent versioning and edit behavior during an active voice session.

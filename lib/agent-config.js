export const MAX_KNOWLEDGE_CHARS = 20_000;
import fs from "node:fs";
import path from "node:path";
const gnaniOptions = JSON.parse(fs.readFileSync(path.join(process.cwd(), "voice_runtime", "voice-options.json"), "utf8").replace(/^\uFEFF/, ""));
const list = (v) => Array.isArray(v) ? v.map(x => String(x).trim()).filter(Boolean) : [];

export function normalizeAgent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Agent draft must be an object.");
  const config = {
    name: String(input.name || "").trim(), purpose: String(input.purpose || input.goal || "").trim(),
    goal: String(input.goal || input.purpose || "").trim(), audience: String(input.audience || "").trim(),
    tasks: list(input.tasks), language: String(input.language || "").trim(), greeting: String(input.greeting || "").trim(),
    voice: String(input.voice || "").trim(), personality: String(input.personality || "").trim(),
    conversationFlow: list(input.conversationFlow || input.conversation_flow), groundRules: list(input.groundRules || input.ground_rules),
    boundaries: list(input.boundaries), fallback: String(input.fallback || "").trim(), escalation: String(input.escalation || "").trim(),
    knowledgeText: String(input.knowledgeText ?? input.knowledge ?? "").trim(),
    interactionType: input.interactionType === "user_first" ? "user_first" : "agent_first",
    sources: Array.isArray(input.sources) ? input.sources.map(s => ({title:String(s.title || "").trim(), url:String(s.url || "").trim()})).filter(s => s.url) : [],
  };
  const language = config.language.toLowerCase().replaceAll("_", "-");
  if (!gnaniOptions.languages.includes(language)) throw new Error(`Unsupported language '${config.language}'. Use a Gnani language code such as en-IN or hi-IN.`);
  if (!gnaniOptions.voices.includes(config.voice)) throw new Error(`Unsupported Gnani voice '${config.voice}'. Supported voices: ${gnaniOptions.voices.join(", ")}.`);
  for (const key of ["name", "purpose", "audience", "language", "greeting", "voice", "personality"]) if (!config[key]) throw new Error(`Fill in ${key} before creating this agent.`);
  if (!config.tasks.length) throw new Error("Add at least one supported task.");
  if (config.knowledgeText.length > MAX_KNOWLEDGE_CHARS) throw new Error(`Knowledge is ${config.knowledgeText.length} characters; the limit is ${MAX_KNOWLEDGE_CHARS}. Narrow the sources and revise the draft.`);
  for (const {url} of config.sources) { try { if (!['http:', 'https:'].includes(new URL(url).protocol)) throw 0; } catch { throw new Error(`Source must be a public HTTP(S) URL: ${url}`); } }
  return config;
}

export function buildInstructions(c) {
  const formatList = (arr, numbered = false) => {
    if (!Array.isArray(arr) || arr.length === 0) return "";
    return arr.map((item, idx) => numbered ? `${idx + 1}. ${item}` : `- ${item}`).join("\n");
  };

  const sections = [
    ["Identity & Role", `${c.name}: ${c.purpose}\nConfigured greeting: "${c.greeting}". Say this opening greeting once upon connection. Do not repeat your introduction on subsequent turns unless the caller explicitly asks who you are.`],
    ["Goal & Outcome", c.goal],
    ["Audience", c.audience],
    ["Supported Tasks", `${formatList(c.tasks)}\nOnly claim capabilities explicitly supported in this configuration. You may collect details or explain an action, but never claim external completion without working integration.`],
    ["Conversation Flow & Decision Logic", formatList(c.conversationFlow, true) || "1. Understand the caller's request.\n2. Answer accurately from verified knowledge.\n3. Offer clear next step."],
    ["Vocal Style, Personality & Cadence", `Language: ${c.language}\nStyle & Delivery: ${c.personality}\nSpeak naturally and idiomatically for speech synthesis. Keep answers concise by default (1-2 short spoken sentences), expanding with helpful context only when asked.`],
    ["Ground Rules & Privacy", formatList(c.groundRules) || "- Ask only for details required to help.\n- Treat all customer information with privacy."],
    ["Boundaries & Guardrails", `${formatList(c.boundaries)}\nNever claim to process payments, update live inventory, or complete unsupported external actions.`],
    ["Uncertainty & Escalation", `Fallback: ${c.fallback || "State what is unknown and offer a helpful next step."}\nEscalation: ${c.escalation || "Direct caller to a human manager or team member when needed."}`]
  ];

  return sections.map(([title, body]) => `### ${title}\n${body.trim()}`).join("\n\n");
}

export function runtimeConfig(c) { return { name:c.name, language:c.language, greeting:c.greeting, greeting_mode:c.interactionType || "agent_first", instructions:buildInstructions(c), voice:c.voice, model:"openai/gpt-oss-20b", knowledge:c.knowledgeText, sources:c.sources }; }

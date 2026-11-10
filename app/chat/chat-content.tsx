"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PromptInput, PromptModel, PromptAction } from "@/components/agents/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation";
import { Orb } from "@/components/ui/orb";
import { Response } from "@/components/ui/response";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon, createHugeIcon } from "@/components/ui/hugeicon";
import {
  ArrowUpRight01Icon,
  BotIcon,
  Building02Icon,
  Calendar03Icon,
  Coffee01Icon,
  File01Icon,
  HeadphonesIcon,
  PuzzleIcon,
  Search01Icon,
  SparklesIcon,
  FlashIcon,
} from "@hugeicons/core-free-icons";

interface PromptSuggestion {
  title: string;
  description: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    title: "Create voice agent for cafe",
    description: "Menu pricing, table reservations & hours",
    prompt: "Create a voice agent for a neighborhood cafe that handles table reservations, menu pricing, and customer inquiries.",
    icon: createHugeIcon(Coffee01Icon),
  },
  {
    title: "Create clinic front-desk receptionist",
    description: "Bookings, doctor timings & patient FAQs",
    prompt: "Create a friendly clinic receptionist voice agent that books appointments, answers FAQs, and shares doctor schedules.",
    icon: createHugeIcon(Calendar03Icon),
  },
  {
    title: "Build customer support voice assistant",
    description: "Order status, returns & policy FAQs",
    prompt: "Build a customer support voice agent for an e-commerce store that handles order tracking, return policies, and escalations.",
    icon: createHugeIcon(HeadphonesIcon),
  },
  {
    title: "Create hotel concierge voice guide",
    description: "Check-in, amenities & local advice",
    prompt: "Create a luxury hotel concierge voice assistant to assist guests with check-in details, room service, and local recommendations.",
    icon: createHugeIcon(Building02Icon),
  },
];

const MODELS: PromptModel[] = [
  {
    value: "gpt-5.2",
    label: "Bol Medium",
    icon: <HugeiconsIcon icon={FlashIcon} className="size-3.5 text-blue-400" />,
  },
  {
    value: "claude-sonnet-4",
    label: "Bol Large",
    icon: <HugeiconsIcon icon={BotIcon} className="size-3.5 text-amber-400" />,
  },
  {
    value: "gemini-3.6-flash",
    label: "Bol XLarge",
    icon: <HugeiconsIcon icon={FlashIcon} className="size-3.5 text-emerald-400" />,
  },
  {
    value: "grok-4.5",
    label: "Bol Small",
    icon: <HugeiconsIcon icon={BotIcon} className="size-3.5 text-purple-400" />,
  },
];

const ACTIONS: PromptAction[] = [
  {
    value: "context",
    label: "Add context",
    description: "Provide store facts, hours, or policy.",
    icon: <HugeiconsIcon icon={File01Icon} className="size-4" />,
  },
  {
    value: "skill",
    label: "Use agent skill",
    description: "Inject specialized voice agent workflow.",
    icon: <HugeiconsIcon icon={PuzzleIcon} className="size-4" />,
  },
  {
    value: "search",
    label: "Search reference",
    description: "Look up verified public business facts.",
    icon: <HugeiconsIcon icon={Search01Icon} className="size-4" />,
  },
];

const DEFAULT_ORB_COLORS: [string, string] = ["#CADCFC", "#A0B9D1"];

function formatToolName(name: string) {
  if (name === "save_agent_draft") return "Saving agent draft…";
  if (name === "websearch") return "Searching web…";
  if (name === "webfetch") return "Fetching web reference…";
  if (name === "skill") return "Consulting skill…";
  return `Tool: ${name}`;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
  streaming?: boolean;
  reasoning?: boolean;
  thinking?: boolean;
  tools?: Array<{ id: string; name: string; status: string }>;
  failed?: boolean;
}

interface Draft {
  id: string;
  name: string;
  purpose: string;
  language: string;
  voice: string;
  tasks?: string[];
  knowledgeText?: string;
  sources?: Array<{ url: string; title?: string }>;
}

export function ChatContent({ initialSessionId }: { initialSessionId?: string }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [opencodeSessionId, setOpencodeSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [creating, setCreating] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);
  const activeSessionIdRef = useRef(sessionId);
  useEffect(() => {
    activeSessionIdRef.current = sessionId;
  }, [sessionId]);

  async function loadDraft(sid: string | undefined) {
    if (!sid) return;
    try {
      const res = await fetch(`/api/agent-drafts?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        setDraft(data.draft || null);
      }
    } catch { }
  }

  useEffect(() => {
    if (initialSessionId) {
      setLoadingHistory(true);
      fetch(`/api/opencode/sessions/${initialSessionId}/messages`, { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.opencodeSessionId) setOpencodeSessionId(data.opencodeSessionId);
          if (Array.isArray(data?.messages)) setMessages(data.messages);
        })
        .catch(() => { })
        .finally(() => setLoadingHistory(false));
      loadDraft(initialSessionId);
    }
  }, [initialSessionId]);

  async function createAgent() {
    if (!draft || creating) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: draft.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create agent.");
      router.push(`/agents/${data.agent.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function sendMessage(explicitText?: string | React.FormEvent) {
    if (isSendingRef.current || busy) return;
    if (explicitText && typeof explicitText !== "string") {
      explicitText.preventDefault();
    }
    const text = (typeof explicitText === "string" ? explicitText : input).trim();
    if (!text) return;

    isSendingRef.current = true;
    setBusy(true);
    setError("");
    setInput("");

    const now = Date.now();
    const userMsgId = `user_${now}`;
    const assistantId = `asst_${now + 1}`;
    const userMsg: Message = { id: userMsgId, role: "user", text, createdAt: now };
    const assistantPlaceholder: Message = {
      id: assistantId,
      role: "assistant",
      text: "",
      createdAt: now + 1,
      streaming: true,
      tools: [],
    };

    // Strictly append User message first, then Assistant placeholder
    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);

    try {
      let activeSessionId = sessionId;

      if (!activeSessionId) {
        const createdRes = await fetch("/api/opencode/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: text.slice(0, 60) }),
        });
        const createdBody = await createdRes.json();
        if (!createdRes.ok) {
          throw new Error(createdBody.error || "Could not start chat session.");
        }
        activeSessionId = createdBody.sessionId;
        setSessionId(activeSessionId);
        activeSessionIdRef.current = activeSessionId;
        if (createdBody.opencodeSessionId) {
          setOpencodeSessionId(createdBody.opencodeSessionId);
        }
        window.history.replaceState(null, "", `/chat/${activeSessionId}`);
      }

      const msgRes = await fetch(`/api/opencode/sessions/${activeSessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const msgBody = await msgRes.json();
      if (!msgRes.ok) throw new Error(msgBody.error || "Could not process message.");

      if (msgBody.opencodeSessionId) {
        setOpencodeSessionId(msgBody.opencodeSessionId);
      }

      if (msgBody.userMessage?.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsgId ? { ...m, id: msgBody.userMessage.id } : m))
        );
      }

      const rawAssistant =
        msgBody.assistantMessage ||
        (Array.isArray(msgBody.messages) ? msgBody.messages.filter((m: any) => m.role === "assistant").at(-1) : null);
      const fullText = rawAssistant?.text || "";
      const tools = rawAssistant?.tools || [];
      const reasoning = rawAssistant?.reasoning || false;
      const canonicalAssistantId = rawAssistant?.id || assistantId;

      await loadDraft(activeSessionId);

      // Animate the response word-by-word on the frontend
      if (fullText) {
        const tokens = fullText.split(/(\s+)/);
        let tokenIndex = 0;

        await new Promise<void>((resolve) => {
          const intervalId = setInterval(() => {
            tokenIndex += 2;
            if (tokenIndex >= tokens.length) {
              clearInterval(intervalId);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                      ...m,
                      id: canonicalAssistantId,
                      text: fullText,
                      streaming: false,
                      tools,
                      reasoning,
                    }
                    : m
                )
              );
              resolve();
            } else {
              const currentPartial = tokens.slice(0, tokenIndex).join("");
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                      ...m,
                      text: currentPartial,
                      streaming: true,
                      tools,
                      reasoning,
                    }
                    : m
                )
              );
            }
          }, 24);
        });
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                ...m,
                id: canonicalAssistantId,
                text: "I processed your request.",
                streaming: false,
                tools,
                reasoning,
              }
              : m
          )
        );
      }
    } catch (sendError: any) {
      setError(sendError instanceof Error ? sendError.message : "Something went wrong.");
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== assistantId)
          .map((m) => (m.id === userMsgId ? { ...m, failed: true } : m))
      );
    } finally {
      isSendingRef.current = false;
      setBusy(false);
    }
  }

  const handleAction = (action: string) => {
    if (action === "context") {
      setInput((prev) => (prev ? `${prev}\n\n[Context]: ` : `[Context]: `));
    } else if (action === "skill") {
      setInput((prev) => (prev ? `${prev}\n\n[Skill]: ` : `[Skill]: `));
    } else if (action === "search") {
      setInput((prev) => (prev ? `${prev}\n\n[Research]: ` : `[Research]: `));
    }
  };

  return (
    <div className="flex h-full flex-1 min-h-0 flex-col font-sans overflow-hidden">
      <Conversation className="flex-1 min-h-0 overflow-y-auto">
        <ConversationContent className="p-4 md:p-6 space-y-4">
          {loadingHistory ? (
            <div className="text-center font-mono text-xs uppercase tracking-wider text-neutral-500 py-12">
              Loading conversation…
            </div>
          ) : messages.length === 0 ? (
            <ConversationEmptyState>
              <div className="mx-auto max-w-2xl w-full space-y-6 text-center py-16 flex flex-col items-center justify-center">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Autonomous Voice Studio
                  </div>
                  <h1 className="text-3xl font-medium tracking-tight text-white md:text-4xl font-sans">
                    What agent should we create?
                  </h1>
                  <p className="text-sm leading-relaxed text-neutral-400 font-sans max-w-md mx-auto">
                    Describe what it should help with and who it should serve. We'll shape the voice persona, knowledge base, and actions together.
                  </p>
                </div>

                {/* Prompt Input placed directly below the text */}
                <div className="w-full text-left pt-2">
                  <PromptInput
                    value={input}
                    onValueChange={setInput}
                    onSubmit={(val) => sendMessage(val)}
                    loading={busy}
                    onStop={() => setBusy(false)}
                    models={MODELS}
                    actions={ACTIONS}
                    defaultModel="gpt-5.2"
                    placeholder="Describe the voice agent you want to build…"
                    onAction={handleAction}
                  />
                </div>

                {/* Prompt suggestion pills */}
                <div className="w-full pt-3 space-y-2 text-left">
                  <div className="flex items-center gap-1.5 px-0.5">
                    <HugeiconsIcon icon={SparklesIcon} className="size-3 text-neutral-400" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
                      Suggested Prompts
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                    {PROMPT_SUGGESTIONS.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={busy}
                          onClick={() => sendMessage(item.prompt)}
                          className="group relative flex h-[68px] sm:h-[72px] w-full items-center justify-between p-1 rounded-2xl border border-white/[0.08] bg-[#141416]/70 hover:bg-[#1a1a1f] hover:border-white/20 active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2 pl-2.5 py-1">
                            <div className="size-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 text-neutral-400 group-hover:text-white group-hover:border-white/20 transition-colors">
                              <Icon className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white transition-colors truncate">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-neutral-400 truncate mt-0.5 font-normal">
                                {item.description}
                              </div>
                            </div>
                          </div>
                          <div className="mr-2 size-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 text-neutral-400 group-hover:text-white group-hover:bg-white/10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300">
                            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ConversationEmptyState>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message, index) => {
                if (message.role === "user") {
                  return (
                    <motion.div
                      key={message.id || `user-${index}`}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="ml-auto max-w-[80%] rounded-2xl bg-[#f4f4f5] px-4 py-2.5 text-sm font-normal text-black shadow-sm selection:bg-neutral-300"
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      {message.failed && (
                        <span className="font-mono text-xs text-red-600 block mt-1">Not sent</span>
                      )}
                    </motion.div>
                  );
                }

                // For assistant responses: only animate the latest response when there are no newer user messages.
                const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf("assistant");
                const hasSubsequentUserMessage = messages.slice(index + 1).some((m) => m.role === "user");
                const isOrbAnimated = index === lastAssistantIndex && !hasSubsequentUserMessage;

                return (
                  <motion.div
                    key={message.id || `assistant-${index}`}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="mr-auto flex max-w-[85%] items-start gap-3"
                  >
                    <Orb
                      className="size-9 shrink-0 mt-0.5 rounded-full"
                      agentState={message.streaming ? "thinking" : isOrbAnimated ? "listening" : null}
                      animated={isOrbAnimated}
                      colors={DEFAULT_ORB_COLORS}
                    />
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="rounded-2xl border border-white/5 bg-[#1c1c1f] px-4 py-3 text-sm text-[#f1f1f3] shadow-sm leading-relaxed">
                        {message.text ? (
                          <Response>{message.text}</Response>
                        ) : message.streaming ? (
                          <span className="italic text-neutral-400">Bol is thinking…</span>
                        ) : null}
                      </div>

                      {message.reasoning && (
                        <details
                          className="rounded-xl border border-white/10 bg-[#121214] text-xs"
                          open={message.streaming && !message.text}
                        >
                          <summary className="cursor-pointer px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-400 hover:text-white flex items-center justify-between">
                            <span>{message.thinking ? "Synthesizing Agent…" : "Reasoning Trace"}</span>
                            <span className="text-[10px] text-neutral-500">details</span>
                          </summary>
                          <div className="max-h-48 overflow-y-auto border-t border-white/10 bg-[#0a0a0c] p-2.5 font-mono text-[11px] text-neutral-400">
                            Bol is working through the request. Private reasoning is contained; action status appears below.
                          </div>
                        </details>
                      )}

                      {message.tools && message.tools.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {message.tools.map((t) => (
                            <span
                              key={t.id}
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase font-medium ${t.status === "running"
                                ? "border-amber-500/30 bg-amber-950/40 text-amber-300"
                                : t.status === "done"
                                  ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
                                  : "border-red-500/30 bg-red-950/40 text-red-300"
                                }`}
                            >
                              <span>{t.status === "running" ? "⚙" : t.status === "done" ? "✓" : "⚠"}</span>
                              <span>{formatToolName(t.name)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}



          {draft && (
            <section className="rounded-2xl border border-white/15 bg-[#121214] p-6 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                  Agent Draft · Ready for Deployment
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Compiled
                </span>
              </div>

              <div>
                <h2 className="text-xl font-medium tracking-tight text-white">{draft.name}</h2>
                <p className="text-sm text-neutral-300 leading-relaxed mt-1">{draft.purpose}</p>
              </div>

              <div className="font-mono text-xs text-neutral-400 flex flex-wrap gap-x-3 gap-y-1 py-1 border-y border-white/5">
                <span>Lang: {draft.language}</span>
                <span>·</span>
                <span>Voice: {draft.voice}</span>
                {draft.tasks && draft.tasks.length > 0 && (
                  <>
                    <span>·</span>
                    <span>Tasks: {draft.tasks.join(", ")}</span>
                  </>
                )}
              </div>

              {draft.knowledgeText && (
                <details className="rounded-xl border border-white/10 bg-[#0d0d0f] p-3 text-xs">
                  <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-neutral-300">
                    Knowledge Preview ({draft.knowledgeText.length} chars)
                  </summary>
                  <p className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap font-mono text-xs text-neutral-400">
                    {draft.knowledgeText}
                  </p>
                </details>
              )}

              {draft.sources && draft.sources.length > 0 && (
                <div className="text-xs text-neutral-400">
                  Sources:{" "}
                  {draft.sources.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-neutral-200 underline underline-offset-4 hover:text-white"
                    >
                      {s.title || s.url}
                    </a>
                  ))}
                </div>
              )}

              <Button
                onClick={createAgent}
                disabled={creating}
                className="w-full sm:w-auto rounded-xl bg-white text-black font-medium hover:bg-neutral-200 text-xs uppercase tracking-wider h-10 px-6 cursor-pointer"
              >
                {creating ? "Creating…" : "Create agent"}
              </Button>
            </section>
          )}

          {error && <div className="font-mono text-xs text-red-400">{error}</div>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {messages.length > 0 && (
        <div className="shrink-0 border-t border-white/10 bg-black p-4">
          <div className="mx-auto max-w-3xl">
            <PromptInput
              value={input}
              onValueChange={setInput}
              onSubmit={(val) => sendMessage(val)}
              loading={busy}
              onStop={() => setBusy(false)}
              models={MODELS}
              actions={ACTIONS}
              defaultModel="gpt-5.2"
              placeholder="Reply to Bol…"
              onAction={handleAction}
            />
          </div>
        </div>
      )}
    </div>
  );
}

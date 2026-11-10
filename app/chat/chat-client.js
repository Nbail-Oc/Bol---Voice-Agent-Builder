"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { applyOpenCodeEvent, inspectOpenCodeEvent, mergeOpenCodeMessages } from "../../lib/opencode-chat.js";

function formatToolName(name) {
  if (name === "save_agent_draft") return "Saving agent draft…";
  if (name === "websearch") return "Searching web…";
  if (name === "webfetch") return "Fetching web reference…";
  if (name === "skill") return "Consulting skill…";
  return `Tool: ${name}`;
}

export default function ChatClient({ initialSessionId = null }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [opencodeSessionId, setOpencodeSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  const [creating, setCreating] = useState(false);
  const conversationEndRef = useRef(null);
  const pendingAssistantIdRef = useRef(null);
  const activeTurnIdRef = useRef(null);
  const activeTurnStartedRef = useRef(false);
  const promptAcceptedRef = useRef(false);

  // Keep ref to active session IDs so SSE handler has latest value
  const activeSessionIdRef = useRef(sessionId);
  useEffect(() => {
    activeSessionIdRef.current = sessionId;
  }, [sessionId]);

  const opencodeSessionIdRef = useRef(opencodeSessionId);
  useEffect(() => {
    opencodeSessionIdRef.current = opencodeSessionId;
  }, [opencodeSessionId]);

  // Load sidebar past sessions
  async function loadSessions() {
    try {
      const res = await fetch("/api/opencode/sessions");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.sessions)) {
          setSessions(data.sessions);
        }
      }
    } catch {
      // Ignore network hiccup on sidebar
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  // Connect to live SSE event stream
  useEffect(() => {
    const source = new EventSource("/api/opencode/events");
    const handle = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const meta = inspectOpenCodeEvent(raw);
        if (meta.sessionId !== opencodeSessionIdRef.current) return;
        if (["session.next.prompted", "session.next.prompt.admitted"].includes(meta.type) && activeTurnIdRef.current) {
          activeTurnStartedRef.current = true;
          promptAcceptedRef.current = true;
        }
        if (meta.assistantMessageID && activeTurnIdRef.current) {
          activeTurnStartedRef.current = true;
          promptAcceptedRef.current = true;
        }
        setMessages((current) => applyOpenCodeEvent(current, raw, {
          sessionId: opencodeSessionIdRef.current,
          pendingId: pendingAssistantIdRef.current,
        }));
        if (meta.error) {
          setError(meta.error);
          pendingAssistantIdRef.current = null;
          activeTurnIdRef.current = null;
          activeTurnStartedRef.current = false;
          promptAcceptedRef.current = false;
          setBusy(false);
        }
        if (meta.complete && activeTurnStartedRef.current) {
          pendingAssistantIdRef.current = null;
          activeTurnIdRef.current = null;
          activeTurnStartedRef.current = false;
          promptAcceptedRef.current = false;
          const localSessionId = activeSessionIdRef.current;
          const openCodeId = opencodeSessionIdRef.current;
          if (localSessionId) {
            fetch(`/api/opencode/sessions/${localSessionId}/messages`, { cache: "no-store" })
              .then((response) => response.ok ? response.json() : null)
              .then((data) => {
                if (data?.messages && opencodeSessionIdRef.current === openCodeId) {
                  setMessages((current) => mergeOpenCodeMessages(data.messages, current));
                }
              })
              .catch(() => {})
              .finally(() => setBusy(false));
            loadDraft(localSessionId);
            loadSessions();
          } else setBusy(false);
        }
      } catch {}
    };
    source.onmessage = handle;
    for (const name of [
      "session.next.text.delta", "session.next.text.ended",
      "session.next.reasoning.started", "session.next.reasoning.delta", "session.next.reasoning.ended",
      "session.next.tool.called", "session.next.tool.success", "session.next.tool.failed",
      "session.next.step.started", "session.next.step.ended", "session.next.prompted",
      "session.next.prompt.admitted", "session.idle", "message.part.delta",
    ]) source.addEventListener(name, handle);
    source.onopen = () => {
      setError((current) => current.startsWith("Live updates disconnected") ? "" : current);
      const localId = activeSessionIdRef.current;
      const openCodeId = opencodeSessionIdRef.current;
      const turnId = activeTurnIdRef.current;
      if (!localId || !openCodeId || !turnId || !promptAcceptedRef.current) return;
      fetch(`/api/opencode/sessions/${localId}/messages`, { cache: "no-store" })
        .then((response) => response.ok ? response.json() : null)
        .then((transcript) => {
        if (opencodeSessionIdRef.current !== openCodeId) return;
        if (transcript?.messages) {
          setMessages((live) => mergeOpenCodeMessages(transcript.messages, live, pendingAssistantIdRef.current));
          const last = transcript.messages.at(-1);
          if (last?.role === "assistant" && !last.streaming && activeTurnIdRef.current === turnId) {
          pendingAssistantIdRef.current = null;
          activeTurnIdRef.current = null;
          activeTurnStartedRef.current = false;
          promptAcceptedRef.current = false;
          setBusy(false);
          }
        }
      }).catch(() => {});
    };
    source.onerror = () => setError("Live updates disconnected. OpenCode will reconnect automatically; the transcript reloads when the turn finishes.");
    return () => source.close();
  }, []);

  // Load chat history when initialSessionId changes
  useEffect(() => {
    if (!initialSessionId) {
      setSessionId(null);
      activeSessionIdRef.current = null;
      setOpencodeSessionId(null);
      opencodeSessionIdRef.current = null;
      setMessages([]);
      setError("");
      return;
    }

    let isCancelled = false;
    setSessionId(initialSessionId);
    activeSessionIdRef.current = initialSessionId;
    setLoadingHistory(true);
    setError("");

    fetch(`/api/opencode/sessions/${initialSessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load session history.");
        return res.json();
      })
      .then((data) => {
        if (!isCancelled) {
          if (Array.isArray(data?.messages)) {
            setMessages(data.messages);
          }
          if (data?.session?.opencode_session_id) {
            setOpencodeSessionId(data.session.opencode_session_id);
            opencodeSessionIdRef.current = data.session.opencode_session_id;
          }
        }
      })
      .catch((loadErr) => {
        if (!isCancelled) {
          setError(loadErr.message);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoadingHistory(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [initialSessionId]);

  async function loadDraft(id = sessionId) {
    if (!id) return setDraft(null);
    try { const res=await fetch(`/api/agent-drafts?sessionId=${encodeURIComponent(id)}`); const data=await res.json(); setDraft(data.draft || null); } catch {}
  }
  useEffect(() => { loadDraft(initialSessionId); }, [initialSessionId]);

  async function createAgent() {
    if (!draft || creating) return;
    setCreating(true); setError("");
    try {
      const res=await fetch("/api/agents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({draftId:draft.id})});
      const data=await res.json(); if(!res.ok) throw new Error(data.error || "Could not create agent.");
      router.push(`/agents/${data.agent.id}`);
    } catch(e) { setError(e.message); }
    finally { setCreating(false); }
  }

  // Auto-scroll when messages update
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function sendMessage(event) {
    if (event) event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    setBusy(true);
    setError("");
    setInput("");

    const turnId = crypto.randomUUID();
    const turnStartedAt = Date.now();
    const userMsg = { id: `local:${turnId}`, role: "user", text, createdAt: turnStartedAt };
    const assistantPlaceholder = { id: `pending:${turnId}`, role: "assistant", text: "", createdAt: turnStartedAt, streaming: true, tools: [] };
    pendingAssistantIdRef.current = assistantPlaceholder.id;
    activeTurnIdRef.current = turnId;
    activeTurnStartedRef.current = false;
    promptAcceptedRef.current = false;
    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);

    let accepted = false;
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
          opencodeSessionIdRef.current = createdBody.opencodeSessionId;
        }
        window.history.replaceState(null, "", `/chat/${activeSessionId}`);
        loadSessions();
      }

      const msgRes = await fetch(`/api/opencode/sessions/${activeSessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const msgBody = await msgRes.json();
      if (!msgRes.ok) throw new Error(msgBody.error || "OpenCode could not accept this message.");
      accepted = true;
      promptAcceptedRef.current = true;
      if (msgBody.opencodeSessionId) {
        setOpencodeSessionId(msgBody.opencodeSessionId);
        opencodeSessionIdRef.current = msgBody.opencodeSessionId;
      }
      if (msgBody.userMessage) {
        setMessages((prev) => prev.map((message) => message.id === userMsg.id ? { ...msgBody.userMessage } : message));
      }
      if (Array.isArray(msgBody.messages) && msgBody.messages.length) {
        setMessages((current) => mergeOpenCodeMessages(msgBody.messages, current, assistantPlaceholder.id));
      }
      else if (msgBody.assistantMessage) {
        setMessages((current) => mergeOpenCodeMessages([msgBody.assistantMessage], current, assistantPlaceholder.id));
      }
      pendingAssistantIdRef.current = null;
      activeTurnIdRef.current = null;
      activeTurnStartedRef.current = false;
      promptAcceptedRef.current = false;
      setBusy(false);
      loadSessions();
      await loadDraft(activeSessionId);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Something went wrong.");
      pendingAssistantIdRef.current = null;
      activeTurnIdRef.current = null;
      activeTurnStartedRef.current = false;
      setMessages((prev) => {
        return prev.filter((message) => message.id !== assistantPlaceholder.id)
          .map((message) => message.id === userMsg.id ? { ...message, failed: true } : message);
      });
    } finally {
      if (!accepted) setBusy(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="chat-shell">
      <aside className="bol-sidebar">
        <Link className="bol-brand" href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/LOGO.png" alt="Bol" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          <span>Bol</span>
        </Link>
        <Link className="bol-new-chat" href="/chat">+ New chat</Link>
        
        <div className="bol-sidebar-section-title">Past chats</div>
        <nav className="bol-sidebar-list">
          {sessions.length === 0 ? (
            <div className="bol-sidebar-empty">No saved chats yet</div>
          ) : (
            sessions.map((s) => (
              <Link
                key={s.id}
                className={`bol-sidebar-item ${s.id === sessionId ? "active" : ""}`}
                href={`/chat/${s.id}`}
              >
                {s.title || "Untitled chat"}
              </Link>
            ))
          )}
        </nav>

        <span className="bol-sidebar-status">OpenCode connected · Live SSE</span>
      </aside>

      <section className="bol-chat-main">
        <header className="bol-chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/LOGO.png" alt="Bol" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
            <span>Agent creator</span>
          </div>
          <span className="bol-local-badge">Running locally</span>
        </header>

        <div className="bol-conversation" aria-live="polite">
          {loadingHistory ? (
            <div className="bol-working">Loading conversation…</div>
          ) : messages.length === 0 ? (
            <div className="bol-chat-welcome">
              <h1>What agent should we create?</h1>
              <p>Describe what it should help with and who it should serve. We’ll shape the agent together.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <article
                className={`bol-message ${message.role} ${message.streaming ? "streaming" : ""}`}
                key={message.id || `${message.role}-${index}`}
              >
                <div className="bol-message-label">
                  {message.role === "user" ? "You" : "OpenCode"}
                  {message.streaming && <span className="bol-live-indicator">● LIVE</span>}
                </div>

                {message.reasoning && (
                  <details className="bol-thinking" open={message.streaming && !message.text}>
                    <summary>{message.thinking ? "Thinking…" : "Thought"}</summary>
                    <div className="bol-thinking-body">OpenCode is working through the request. Private reasoning text is hidden; tool activity appears below.</div>
                  </details>
                )}

                {message.tools && message.tools.length > 0 && (
                  <div className="bol-tool-list">
                    {message.tools.map((t) => (
                      <div key={t.id} className={`bol-tool-badge ${t.status}`}>
                        <span>{t.status === "running" ? "⚙️" : t.status === "done" ? "✓" : "⚠"}</span>
                        <span>{formatToolName(t.name)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {message.failed && <span className="bol-error">Not sent</span>}
                {message.text ? (
                  <p>{message.text}</p>
                ) : message.streaming ? (
                  <p className="bol-thinking-placeholder">OpenCode is working…</p>
                ) : null}
              </article>
            ))
          )}
          {busy && <div className="bol-working">OpenCode is working…</div>}
          {draft && <section className="draft-card">
            <div className="bol-message-label">Draft · review before creating</div>
            <h2>{draft.name}</h2><p>{draft.purpose}</p>
            <div className="draft-meta">{draft.language} · {draft.voice} · {draft.tasks?.join(" · ")}</div>
            {draft.knowledgeText && <details><summary>Knowledge preview</summary><p>{draft.knowledgeText}</p></details>}
            {draft.sources?.length > 0 && <div className="draft-sources">Sources: {draft.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.title || s.url}</a>)}</div>}
            <button className="button" onClick={createAgent} disabled={creating}>{creating?"Creating…":"Create agent"}</button>
          </section>}
          {error && <div className="bol-error">{error}</div>}
          <div ref={conversationEndRef} />
        </div>

        <form className="bol-composer" onSubmit={sendMessage}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the voice agent you want to build…"
            rows={2}
            disabled={busy || loadingHistory}
          />
          <div className="bol-composer-footer">
            <p>Press Enter to send, Shift+Enter for newline.</p>
            <button className="button" type="submit" disabled={busy || loadingHistory || !input.trim()}>
              {busy ? "Working…" : "Send"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

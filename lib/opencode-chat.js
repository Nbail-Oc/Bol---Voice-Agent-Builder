export function normalizeOpenCodeMessages(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.flatMap((entry, index) => {
    const info = entry?.info || entry;
    const role = info?.role || info?.type;
    if (role !== "user" && role !== "assistant") return [];
    const parts = entry?.parts || entry?.content;
    const textParts = Array.isArray(parts) ? parts.filter((part) => part?.type === "text") : [];
    const text = textParts.length
      ? textParts.map((part) => part.text || "").join("")
      : typeof entry?.text === "string" ? entry.text : typeof info?.text === "string" ? info.text : "";
    const reasoning = Array.isArray(parts) && parts.some((part) => part?.type === "reasoning");
    const tools = Array.isArray(parts)
      ? parts.filter((part) => part?.type === "tool").map((part) => ({
          id: part.callID || part.id || `${info.id}-tool`,
          name: part.tool || part.name || "tool",
          status: part.state?.status === "error" ? "failed" : part.state?.status === "completed" ? "done" : "running",
        }))
      : [];
    return [{
      id: info.id,
      parentID: info.parentID,
      role,
      text,
      reasoning,
      tools,
      createdAt: info.time?.created ?? entry?.time?.created ?? index,
      streaming: info.time?.completed == null && role === "assistant",
    }];
  }).sort((a, b) => a.createdAt - b.createdAt);
}

export function mergeOpenCodeMessages(canonical, live, pendingId) {
  const merged = canonical.map((message) => {
    const current = live.find((item) => item.id === message.id);
    if (!current) return message;
    const tools = new Map((message.tools || []).map((tool) => [tool.id, tool]));
    for (const tool of current.tools || []) tools.set(tool.id, { ...tools.get(tool.id), ...tool });
    return { ...current, ...message, text: (current.text?.length || 0) > (message.text?.length || 0) ? current.text : message.text, tools: [...tools.values()] };
  });
  for (const message of live) {
    if (merged.some((item) => item.id === message.id)) continue;
    const messageTime = message.createdAt ?? message.created_at;
    if (message.id?.startsWith("local:") && canonical.some((item) =>
      item.role === "user" && item.text === message.text && Number.isFinite(messageTime) &&
      Number.isFinite(item.createdAt) && item.createdAt >= messageTime - 2_000
    )) continue;
    if (message.id === pendingId && canonical.some((item) =>
      item.role === "assistant" && !item.streaming && Number.isFinite(messageTime) &&
      Number.isFinite(item.createdAt) && item.createdAt >= messageTime
    )) continue;
    if (message.id === pendingId || message.id?.startsWith("local:") || !canonical.some((item) => item.id === message.id)) merged.push(message);
  }
  return merged.sort((a, b) => (a.createdAt ?? Number.MAX_SAFE_INTEGER) - (b.createdAt ?? Number.MAX_SAFE_INTEGER));
}

export function inspectOpenCodeEvent(rawEvent) {
  const event = rawEvent?.payload || rawEvent?.event || rawEvent?.data?.payload || rawEvent;
  const fields = event?.properties || event?.data || {};
  const type = event?.type;
  const eventSessionId = fields.sessionID || fields.sessionId || event?.sessionID || event?.sessionId;
  return {
    event,
    fields,
    type,
    messageID: fields.messageID,
    assistantMessageID: fields.assistantMessageID || (event?.type === "message.part.delta" ? fields.messageID : null),
    sessionId: eventSessionId,
    complete: type === "session.idle",
    error: type === "session.error" ? fields.error?.message || fields.message || "OpenCode reported an error." : null,
  };
}

export function applyOpenCodeEvent(messages, rawEvent, { sessionId, pendingId } = {}) {
  const { fields, type, sessionId: eventSessionId } = inspectOpenCodeEvent(rawEvent);
  if (!type || !sessionId || eventSessionId !== sessionId) return messages;
  if (["session.idle", "session.error"].includes(type)) return messages;

  const assistantId = fields.assistantMessageID || (type === "message.part.delta" ? fields.messageID : null);
  if (!assistantId) return messages;

  let next = messages;
  const updateAssistant = (update) => {
    const index = next.findIndex((message) => message.id === assistantId);
    if (index >= 0) {
      next = [...next];
      next[index] = update(next[index]);
      return;
    }
    const pendingIndex = pendingId ? next.findIndex((message) => message.id === pendingId) : -1;
    const base = { id: assistantId, role: "assistant", text: "", tools: [], createdAt: next[pendingIndex]?.createdAt ?? Date.now(), streaming: true };
    if (pendingIndex >= 0) {
      next = [...next];
      next[pendingIndex] = update(base);
    } else next = [...next, update(base)];
  };

  if (type === "session.next.text.delta" || (type === "message.part.delta" && fields.field === "text")) {
    if (typeof fields.delta === "string") updateAssistant((message) => ({ ...message, text: message.text + fields.delta, streaming: true }));
  } else if (type === "session.next.text.ended") {
    if (typeof fields.text === "string") updateAssistant((message) => ({ ...message, text: fields.text, streaming: true }));
  } else if (["session.next.reasoning.started", "session.next.reasoning.delta", "session.next.step.started"].includes(type)) {
    updateAssistant((message) => ({ ...message, reasoning: true, thinking: true, streaming: true }));
  } else if (["session.next.reasoning.ended", "session.next.step.ended"].includes(type)) {
    updateAssistant((message) => ({ ...message, reasoning: true, thinking: false, streaming: true }));
  } else if (type === "session.next.text.started") {
    updateAssistant((message) => ({ ...message, streaming: true }));
  } else if (type === "session.next.tool.called") {
    const tool = { id: fields.callID || `${assistantId}-${fields.tool || "tool"}`, name: fields.tool || "tool", status: "running" };
    updateAssistant((message) => ({ ...message, tools: [...(message.tools || []).filter((item) => item.id !== tool.id), tool], streaming: true }));
  } else if (["session.next.tool.success", "session.next.tool.failed"].includes(type)) {
    updateAssistant((message) => ({ ...message, tools: (message.tools || []).map((tool) => !fields.callID || tool.id === fields.callID ? { ...tool, status: type.endsWith("failed") ? "failed" : "done" } : tool), streaming: true }));
  }

  return next;
}

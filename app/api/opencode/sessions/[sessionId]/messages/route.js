import { NextResponse } from "next/server";
import { createOpenCodeSession, listOpenCodeMessages, sendOpenCodeMessage, waitForSessionIdle } from "../../../../../../lib/opencode.js";
import { normalizeOpenCodeMessages } from "../../../../../../lib/opencode-chat.js";
import {
  getSession,
  createSession,
  addMessage,
  getSessionMessages,
  updateSession,
  getSessionWorkspace,
} from "../../../../../../lib/db.js";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (!session.opencode_session_id) return NextResponse.json({ messages: getSessionMessages(sessionId) });
  try {
    const { workspaceDir } = getSessionWorkspace(sessionId);
    const entries = await listOpenCodeMessages(session.opencode_session_id, workspaceDir);
    return NextResponse.json({ messages: normalizeOpenCodeMessages(entries) });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not load OpenCode messages." }, { status: 502 });
  }
}

export async function POST(request, { params }) {
  const { sessionId } = await params;
  let text;

  try {
    ({ text } = await request.json());
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Message text is required." }, { status: 400 });
  }

  const userText = text.trim();

  // Ensure session exists in local database and file system
  let session = getSession(sessionId);
  if (!session) {
    session = createSession(sessionId, userText.slice(0, 60));
  } else if (session.title === "New chat") {
    updateSession(sessionId, { title: userText.slice(0, 60) });
  }

  // Get session dedicated workspace directory
  const { workspaceDir } = getSessionWorkspace(sessionId);

  // Determine OpenCode session ID
  let ocSessionId = session.opencode_session_id;
  if (!ocSessionId) {
    try {
      const created = await createOpenCodeSession(session.title, workspaceDir);
      if (created?.id) {
        ocSessionId = created.id;
        updateSession(sessionId, { opencodeSessionId: ocSessionId });
      }
    } catch {
      // Continue without blocking
    }
  }

  try {
    if (!ocSessionId) {
      throw new Error("OpenCode service is not reachable. Ensure 'opencode service' is running at http://127.0.0.1:28894.");
    }

    // Capture the latest assistant message ID before sending the prompt
    let previousAssistantId = null;
    try {
      const existingEntries = await listOpenCodeMessages(ocSessionId, workspaceDir);
      const prevAsst = existingEntries.find((m) => (m?.info?.role || m?.role || m?.type || m?.info?.type) === "assistant");
      previousAssistantId = prevAsst?.info?.id || prevAsst?.id || null;
    } catch {}

    await sendOpenCodeMessage(ocSessionId, userText, workspaceDir);
    const userMessage = addMessage(sessionId, "user", userText);

    // Wait until OpenCode completes generating the brand new response
    await waitForSessionIdle(ocSessionId, workspaceDir, previousAssistantId, 45000);

    let messages = [];
    try {
      const rawEntries = await listOpenCodeMessages(ocSessionId, workspaceDir);
      messages = normalizeOpenCodeMessages(rawEntries);
    } catch {}

    const assistantMessage = messages.filter((m) => m.role === "assistant").at(-1) || null;
    if (assistantMessage?.text) {
      addMessage(sessionId, "assistant", assistantMessage.text);
    }

    return NextResponse.json({
      accepted: true,
      completed: true,
      messages,
      assistantMessage,
      userMessage,
      opencodeSessionId: ocSessionId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "OpenCode could not answer this message.",
      },
      { status: 502 },
    );
  }
}

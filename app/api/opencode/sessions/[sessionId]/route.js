import { NextResponse } from "next/server";
import { getSession, getSessionMessages, getSessionWorkspace, deleteSession } from "../../../../../lib/db.js";
import { listOpenCodeMessages } from "../../../../../lib/opencode.js";
import { normalizeOpenCodeMessages } from "../../../../../lib/opencode-chat.js";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  if (session.opencode_session_id) {
    try {
      const { workspaceDir } = getSessionWorkspace(sessionId);
      const messages = normalizeOpenCodeMessages(await listOpenCodeMessages(session.opencode_session_id, workspaceDir));
      return NextResponse.json({ session, messages });
    } catch (error) {
      return NextResponse.json({ error: error.message || "Could not load the OpenCode transcript." }, { status: 502 });
    }
  }
  return NextResponse.json({ session, messages: getSessionMessages(sessionId) });
}

export async function DELETE(request, { params }) {
  const { sessionId } = await params;
  deleteSession(sessionId);
  return NextResponse.json({ success: true });
}


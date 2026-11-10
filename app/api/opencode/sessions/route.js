import { NextResponse } from "next/server";
import { createOpenCodeSession } from "../../../../lib/opencode.js";
import { createSession, listSessions, getSessionWorkspace, updateSession } from "../../../../lib/db.js";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sessions = listSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not fetch sessions." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "New chat";
    // 1. Create Bol chat session and its dedicated workspace in sessions/<sessionId>/
    const session = createSession(null, title.slice(0, 100), null);
    const { workspaceDir } = getSessionWorkspace(session.id);

    // 2. Create OpenCode session with workspace directory set
    const ocSession = await createOpenCodeSession(title.slice(0, 100), workspaceDir);
    const opencodeSessionId = ocSession?.id ?? null;

    if (opencodeSessionId) {
      updateSession(session.id, { opencodeSessionId });
      session.opencode_session_id = opencodeSessionId;
    }

    return NextResponse.json({
      sessionId: session.id,
      opencodeSessionId: session.opencode_session_id,
      title: session.title,
      workspace: workspaceDir,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create chat session." },
      { status: 500 },
    );
  }
}

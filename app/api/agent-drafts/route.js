import { NextResponse } from "next/server";
import { getSession, getSessionByOpenCodeId } from "../../../lib/db.js";
import { getDraft, saveDraft } from "../../../lib/agent-store.js";
export const runtime="nodejs";
export async function GET(request) {
  const id=new URL(request.url).searchParams.get("sessionId");
  if (!id || !getSession(id)) return NextResponse.json({error:"Chat session not found."},{status:404});
  return NextResponse.json({draft:getDraft(id)});
}
export async function POST(request) {
  try {
    const {opencodeSessionId,config}=await request.json();
    const session=getSessionByOpenCodeId(opencodeSessionId);
    if (!session) return NextResponse.json({error:"OpenCode chat is not linked to a Bol session."},{status:404});
    return NextResponse.json({draft:saveDraft(session.id,config)});
  } catch(e) { return NextResponse.json({error:e.message || "Could not save draft."},{status:400}); }
}

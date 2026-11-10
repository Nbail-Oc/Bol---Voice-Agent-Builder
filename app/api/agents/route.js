import { NextResponse } from "next/server";
import { createAgentFromDraft, listAgents, seedDemoAgent } from "../../../lib/agent-store.js";
export const runtime="nodejs";
export async function GET() { seedDemoAgent(); return NextResponse.json({agents:listAgents()}); }
export async function POST(request) {
  try { const {draftId}=await request.json(); if (!draftId) throw new Error("Choose a draft to create."); return NextResponse.json({agent:createAgentFromDraft(draftId)},{status:201}); }
  catch(e) { return NextResponse.json({error:e.message},{status:400}); }
}

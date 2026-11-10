import { NextResponse } from "next/server";
import { deleteAgent, getAgent, updateAgent } from "../../../../lib/agent-store.js";
export const runtime="nodejs";
export async function GET(_request,{params}) { const {agentId}=await params, agent=getAgent(agentId); return agent?NextResponse.json({agent}):NextResponse.json({error:"Agent not found."},{status:404}); }
export async function PATCH(request,{params}) { try { const {agentId}=await params, body=await request.json(), agent=updateAgent(agentId,body.config || body); return agent?NextResponse.json({agent}):NextResponse.json({error:"Agent not found."},{status:404}); } catch(e) { return NextResponse.json({error:e.message},{status:400}); } }
export async function DELETE(_request,{params}) { const {agentId}=await params; return deleteAgent(agentId)?new NextResponse(null,{status:204}):NextResponse.json({error:"Agent not found."},{status:404}); }

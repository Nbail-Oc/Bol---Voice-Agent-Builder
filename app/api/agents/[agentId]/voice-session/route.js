import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { spawn } from "node:child_process";
import { getAgent, runtimeConfig } from "../../../../../lib/agent-store.js";

export const runtime="nodejs";
const state=globalThis.__bolVoiceSessions ||= new Map();
const recentLogs=globalThis.__bolVoiceLogs ||= new Map();
globalThis.__bolVoiceStarting ??= false;
const root=process.cwd(), runtimeDir=path.join(root,"voice_runtime"), python=path.join(runtimeDir,".venv",process.platform==="win32"?"Scripts/python.exe":"bin/python");
function portOpen(port){return new Promise(resolve=>{const s=net.createServer();s.once("error",()=>resolve(false));s.listen(port,"127.0.0.1",()=>s.close(()=>resolve(true)));});}
async function findPort(){for(let port=7861;port<7961;port++)if(await portOpen(port))return port;throw Error("No local voice runtime port is available.");}
export async function POST(_request,{params}){
 let reserved=false;
 try{
  const {agentId}=await params,agent=getAgent(agentId);if(!agent)return NextResponse.json({error:"Agent not found."},{status:404});
  const active=[...state.values()].find(s=>s.child.exitCode===null);if(active||globalThis.__bolVoiceStarting)return NextResponse.json({error:"Another local voice session is active. End it before starting this agent."},{status:409});
  if(!fs.existsSync(python))return NextResponse.json({error:"Voice runtime is not installed. Set up voice_runtime/.venv using its requirements.txt."},{status:503});
  globalThis.__bolVoiceStarting=true;reserved=true;
  const body=await _request.json().catch(()=>({})),interactionType=body.interactionType||agent.interactionType||"agent_first";
  const port=await findPort(),configDir=path.join(root,".bol","agent-configs");fs.mkdirSync(configDir,{recursive:true});const configPath=path.join(configDir,`${agentId}.json`);fs.writeFileSync(configPath,JSON.stringify({...runtimeConfig(agent),greeting_mode:interactionType},null,2));
  const child=spawn(python,[path.join(runtimeDir,"agent.py"),"-t","webrtc","--port",String(port)],{cwd:runtimeDir,windowsHide:true,stdio:["ignore","pipe","pipe"],env:{...process.env,PYTHONIOENCODING:"utf-8",BOL_AGENT_CONFIG:configPath}});
  const session={child,port,startedAt:Date.now(),logs:""};recentLogs.set(agentId,"");
  for(const stream of [child.stdout,child.stderr])stream.on("data",b=>{session.logs=(session.logs+b.toString()).slice(-12000);recentLogs.set(agentId,session.logs);});
  state.set(agentId,session);child.once("exit",()=>{recentLogs.set(agentId,session.logs);if(state.get(agentId)===session)state.delete(agentId);});
  const deadline=Date.now()+20000;while(Date.now()<deadline){if(child.exitCode!==null)throw Error(session.logs||`Voice runtime stopped with code ${child.exitCode}.`);try{const r=await fetch(`http://127.0.0.1:${port}/status`,{signal:AbortSignal.timeout(500)});if(r.ok)return NextResponse.json({endpoint:`http://127.0.0.1:${port}/start`});}catch{} await new Promise(r=>setTimeout(r,250));}
  child.kill();state.delete(agentId);throw Error(session.logs||"Voice runtime did not become ready. Check Gnani and Groq credentials in voice_runtime/.env.");
 }catch(e){return NextResponse.json({error:e.message||"Could not start voice runtime."},{status:500});}
 finally{if(reserved)globalThis.__bolVoiceStarting=false;}
}
export async function GET(_request,{params}){const {agentId}=await params,s=state.get(agentId);return NextResponse.json({active:Boolean(s&&s.child.exitCode===null),logs:s?.logs||recentLogs.get(agentId)||"",port:s?.port||null});}
export async function DELETE(_request,{params}){const {agentId}=await params,s=state.get(agentId);if(s){recentLogs.set(agentId,s.logs);if(process.platform==="win32")spawn("taskkill",["/pid",String(s.child.pid),"/t","/f"],{windowsHide:true,stdio:"ignore"});else s.child.kill("SIGTERM");state.delete(agentId);}return new NextResponse(null,{status:204});}

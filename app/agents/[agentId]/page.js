import AgentEditor from "./editor.js";
import { getAgent } from "../../../lib/agent-store.js";
export const runtime="nodejs";
export default async function AgentPage({params}) { const {agentId}=await params, agent=getAgent(agentId); return <AgentEditor initialAgent={agent}/>; }

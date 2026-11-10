import VoiceClient from "./voice-client.js";
import { getAgent } from "../../../../lib/agent-store.js";
export const runtime="nodejs";
export default async function VoicePage({params}){const {agentId}=await params;return <VoiceClient agent={getAgent(agentId)}/>;}

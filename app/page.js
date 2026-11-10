import { listAgents, seedDemoAgent } from "../lib/agent-store.js";
import TechLanding from "./tech-landing.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function HomePage() {
  seedDemoAgent();
  const agents = listAgents();
  return <TechLanding agents={agents} />;
}

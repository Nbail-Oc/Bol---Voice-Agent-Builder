import { db, generateId, getSessionWorkspace } from "./db.js";
import fs from "node:fs";
import path from "node:path";
import { normalizeAgent, runtimeConfig } from "./agent-config.js";

const parse = row => row && ({ id:row.id, ...JSON.parse(row.config_json), createdAt:row.created_at, updatedAt:row.updated_at });
export function listAgents() { return db.prepare("SELECT * FROM agents ORDER BY updated_at DESC").all().map(parse); }
export function getAgent(id) { return parse(db.prepare("SELECT * FROM agents WHERE id=?").get(id)); }
export function saveDraft(sessionId, input) {
  const config = normalizeAgent(input), now=Date.now(), old=db.prepare("SELECT id FROM agent_drafts WHERE session_id=?").get(sessionId), id=old?.id || generateId("draft");
  db.prepare(`INSERT INTO agent_drafts(id,session_id,config_json,created_at,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET config_json=excluded.config_json,updated_at=excluded.updated_at`).run(id,sessionId,JSON.stringify(config),now,now);
  
  try {
    const { dir, workspaceDir } = getSessionWorkspace(sessionId);
    const draftContent = JSON.stringify({ id, ...config, updatedAt: now }, null, 2);
    for (const target of [dir, workspaceDir]) {
      fs.writeFileSync(path.join(target, "draft.json"), draftContent, "utf8");
      if (config.knowledgeText) {
        fs.writeFileSync(path.join(target, "knowledge.md"), `# Knowledge Base for ${config.name || "Agent"}\n\n${config.knowledgeText}\n`, "utf8");
      }
    }
  } catch (err) {
    console.warn("Could not sync draft to workspace disk:", err.message);
  }

  return {id, ...config, updatedAt:now};
}
export function getDraft(sessionId) { return parse(db.prepare("SELECT * FROM agent_drafts WHERE session_id=?").get(sessionId)); }
export function createAgentFromDraft(draftId) {
  const row=db.prepare("SELECT * FROM agent_drafts WHERE id=?").get(draftId); if (!row) throw new Error("Draft expired. Ask OpenCode to save it again.");
  const config=normalizeAgent(JSON.parse(row.config_json)), id=generateId("agent"), now=Date.now();
  db.prepare("INSERT INTO agents(id,config_json,created_at,updated_at) VALUES(?,?,?,?)").run(id,JSON.stringify(config),now,now);
  return getAgent(id);
}
export function updateAgent(id, input) { const config=normalizeAgent(input); db.prepare("UPDATE agents SET config_json=?,updated_at=? WHERE id=?").run(JSON.stringify(config),Date.now(),id); return getAgent(id); }
export function deleteAgent(id) { return db.prepare("DELETE FROM agents WHERE id=?").run(id).changes > 0; }
export function seedDemoAgent() {
  if (db.prepare("SELECT value FROM app_meta WHERE key='demo-agent-seeded'").get()) return;
  try {
    const old=JSON.parse(fs.readFileSync(path.join(process.cwd(),"voice_runtime","agent.json"),"utf8"));
    const config=normalizeAgent({name:old.name,purpose:"Answer customers for the neighborhood tea shop.",goal:"Help callers with menu, prices, and opening hours.",audience:"Tea shop customers",tasks:["Answer questions about the menu, prices, and opening hours"],language:old.language,greeting:old.greeting,voice:old.voice,personality:"Warm, concise, and natural",conversationFlow:["Understand the question","Answer from the shop knowledge"],groundRules:["Use only known shop facts"],boundaries:["Do not claim to place orders or make bookings"],fallback:"Say when the answer is not available.",escalation:"Suggest contacting the shop directly.",knowledgeText:old.knowledge,sources:[]});
    const now=Date.now(); db.prepare("INSERT INTO agents(id,config_json,created_at,updated_at) VALUES(?,?,?,?)").run(generateId("agent"),JSON.stringify(config),now,now);
  } catch (e) { console.warn("Could not seed demo agent:",e.message); }
  db.prepare("INSERT OR REPLACE INTO app_meta(key,value) VALUES('demo-agent-seeded','1')").run();
}
export { runtimeConfig };

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const dataDir = path.join(process.cwd(), ".bol");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sessionsRootDir = path.join(process.cwd(), "sessions");
if (!fs.existsSync(sessionsRootDir)) {
  fs.mkdirSync(sessionsRootDir, { recursive: true });
}

const dbPath = path.join(dataDir, "bol.db");
export const db = new DatabaseSync(dbPath);

// WAL mode and schema init
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    opencode_session_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);

  CREATE TABLE IF NOT EXISTS agent_drafts (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    config_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    config_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

export function generateId(prefix = "chat") {
  return `${prefix}_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
}

export function getSessionWorkspace(sessionId) {
  const dir = path.join(sessionsRootDir, sessionId);
  const workspaceDir = path.join(dir, "workspace");
  if (!fs.existsSync(workspaceDir)) {
    fs.mkdirSync(workspaceDir, { recursive: true });
  }
  ensureSessionHarness(sessionId);
  return { dir, workspaceDir };
}

const DEFAULT_OPENCODE_CONFIG = JSON.parse(fs.readFileSync(path.join(process.cwd(), "opencode.json"), "utf8"));
const DEFAULT_AGENTS_MD = fs.readFileSync(path.join(process.cwd(), "AGENTS.md"), "utf8");

const DEFAULT_INITIAL_DRAFT = {
  name: "",
  purpose: "",
  goal: "",
  audience: "",
  tasks: [],
  language: "en-IN",
  voice: "Nalini",
  greeting: "",
  personality: "Warm, professional, concise, and helpful",
  conversationFlow: [],
  groundRules: [],
  boundaries: [],
  fallback: "I'm sorry, I don't have that information right now.",
  escalation: "Let me direct you to a team member who can help.",
  knowledgeText: "",
  sources: []
};

const DEFAULT_KNOWLEDGE_MD = `# Session Knowledge Notes

This file stages and curates factual domain knowledge for this Bol voice agent.
All knowledge must stay under 20,000 characters.
`;

export function ensureSessionHarness(sessionId) {
  try {
    const dir = path.join(sessionsRootDir, sessionId);
    const workspaceDir = path.join(dir, "workspace");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(workspaceDir)) fs.mkdirSync(workspaceDir, { recursive: true });

    const rootOpencodeConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "opencode.json"), "utf8"));
    const rootAgentsMd = fs.readFileSync(path.join(process.cwd(), "AGENTS.md"), "utf8");
    const targetDirs = [dir, workspaceDir];
    const opencodeConfigStr = JSON.stringify(rootOpencodeConfig, null, 2);
    const draftJsonStr = JSON.stringify(DEFAULT_INITIAL_DRAFT, null, 2);

    for (const target of targetDirs) {
      const ocPath = path.join(target, "opencode.json");
      fs.writeFileSync(ocPath, opencodeConfigStr, "utf8");

      const agentsMdPath = path.join(target, "AGENTS.md");
      fs.writeFileSync(agentsMdPath, rootAgentsMd, "utf8");

      const draftPath = path.join(target, "draft.json");
      if (!fs.existsSync(draftPath)) {
        fs.writeFileSync(draftPath, draftJsonStr, "utf8");
      }

      const knowledgePath = path.join(target, "knowledge.md");
      if (!fs.existsSync(knowledgePath)) {
        fs.writeFileSync(knowledgePath, DEFAULT_KNOWLEDGE_MD, "utf8");
      }
    }
  } catch (err) {
    console.warn("ensureSessionHarness error:", err.message);
  }
}

function syncToDisk(sessionId) {
  try {
    const session = getSession(sessionId);
    if (!session) return;
    const messages = getSessionMessages(sessionId);
    const { dir } = getSessionWorkspace(sessionId);
    fs.writeFileSync(path.join(dir, "session.json"), JSON.stringify(session, null, 2), "utf8");
    fs.writeFileSync(path.join(dir, "messages.json"), JSON.stringify(messages, null, 2), "utf8");
  } catch (err) {
    console.warn("Disk sync error:", err.message);
  }
}

export function createSession(id, title = "New chat", opencodeSessionId = null) {
  const sessionId = id || generateId("chat");
  const now = Date.now();
  db.prepare(`
    INSERT INTO sessions (id, title, opencode_session_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(sessionId, title, opencodeSessionId, now, now);

  const session = { id: sessionId, title, opencode_session_id: opencodeSessionId, created_at: now, updated_at: now };
  syncToDisk(sessionId);
  return session;
}

export function getSession(id) {
  return db.prepare("SELECT * FROM sessions WHERE id = ?").get(id);
}

export function getSessionByOpenCodeId(id) {
  return db.prepare("SELECT * FROM sessions WHERE opencode_session_id = ?").get(id);
}

export function listSessions() {
  return db.prepare("SELECT * FROM sessions ORDER BY updated_at DESC").all();
}

export function updateSession(id, { title, opencodeSessionId }) {
  const updates = [];
  const params = [];
  if (title !== undefined) {
    updates.push("title = ?");
    params.push(title);
  }
  if (opencodeSessionId !== undefined) {
    updates.push("opencode_session_id = ?");
    params.push(opencodeSessionId);
  }
  updates.push("updated_at = ?");
  params.push(Date.now());
  params.push(id);
  db.prepare(`UPDATE sessions SET ${updates.join(", ")} WHERE id = ?`).run(...params);
  syncToDisk(id);
}

export function addMessage(sessionId, role, text) {
  const id = generateId("msg");
  const now = Date.now();
  db.prepare(`
    INSERT INTO messages (id, session_id, role, text, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, sessionId, role, text, now);
  db.prepare("UPDATE sessions SET updated_at = ? WHERE id = ?").run(now, sessionId);
  syncToDisk(sessionId);
  return { id, session_id: sessionId, role, text, created_at: now };
}

export function getSessionMessages(sessionId) {
  return db.prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC").all(sessionId);
}

export function deleteSession(id) {
  db.prepare("DELETE FROM messages WHERE session_id = ?").run(id);
  db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
  try {
    const dir = path.join(sessionsRootDir, id);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch {}
}

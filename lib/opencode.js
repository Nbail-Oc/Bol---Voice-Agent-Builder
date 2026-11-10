import { createOpencodeClient } from "@opencode-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const baseUrl = process.env.OPENCODE_BASE_URL ?? "http://127.0.0.1:28894";

function getServiceCredentials() {
  const username = process.env.OPENCODE_SERVER_USERNAME || "opencode";
  let password = process.env.OPENCODE_SERVER_PASSWORD;

  if (!password) {
    try {
      const configPath = path.join(
        process.env.USERPROFILE || process.env.HOME || "",
        ".config",
        "opencode",
        "service.json"
      );
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, "utf8");
        const data = JSON.parse(raw);
        if (data.password) {
          password = data.password;
        }
      }
    } catch {}
  }

  const authorization = password
    ? `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
    : undefined;

  return { username, password, authorization };
}

export function getAuthHeaders(directory) {
  const { authorization } = getServiceCredentials();
  const headers = { "Content-Type": "application/json" };
  if (authorization) {
    headers.Authorization = authorization;
  }
  if (directory) {
    headers["x-opencode-directory"] = directory;
  }
  return headers;
}

export const openCodeClient = createOpencodeClient({
  baseUrl,
  fetch: (input, init = {}) => {
    const { authorization } = getServiceCredentials();
    return fetch(input, {
      ...init,
      headers: {
        ...init.headers,
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });
  },
});

export async function getOpenCodeHealth() {
  try {
    const res = await fetch(`${baseUrl}/api/global/health`, { headers: getAuthHeaders() });
    if (res.ok) {
      return { healthy: true, version: "OpenCode" };
    }
  } catch {}

  try {
    const res = await fetch(`${baseUrl}/api/provider`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return { healthy: true, version: "OpenCode", providers: Array.isArray(data) ? data.map(p => p.name || p.id) : [] };
    }
  } catch {}

  return { healthy: false };
}

export async function createOpenCodeSession(title, directory) {
  const headers = getAuthHeaders(directory);

  for (const url of [`${baseUrl}/api/session`, `${baseUrl}/session`]) {
    try {
      const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ title: title || "Bol chat" }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const result = await res.json();
        const data = result?.data || result;
        if (data?.id) {
        await delay(400);
          return { id: data.id, title };
        }
      }
    } catch (err) {
      console.warn(`Could not create OpenCode session: ${err.message}`);
    }
  }
  return { id: null, title };
}

export async function sendOpenCodeMessage(sessionId, text, directory) {
  const payload = { text, agent: "bol-builder", agents: [{ name: "bol-builder" }], parts: [{ type: "text", text }] };
  const urls = [
    `${baseUrl}/api/session/${sessionId}/prompt`,
    `${baseUrl}/api/session/${sessionId}/message`,
  ];

  for (const url of urls) {
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(directory),
        body: JSON.stringify(payload),
      });
    } catch (error) {
      throw new Error(`Could not reach OpenCode while submitting this message: ${error.message}`);
    }
    if (response.ok && response.headers.get("content-type")?.includes("application/json")) return await response.json();
    if (response.status !== 404) {
      const detail = await response.text();
      throw new Error(detail || `OpenCode did not return a valid message (${response.status}).`);
    }
  }
  throw new Error("OpenCode does not expose a supported message endpoint.");
}

export async function listOpenCodeMessages(sessionId, directory) {
  const urls = [`${baseUrl}/api/session/${sessionId}/message`, `${baseUrl}/session/${sessionId}/message`];
  let lastError;
  for (const url of urls) {
    try {
      const response = await fetch(url, { headers: getAuthHeaders(directory), cache: "no-store" });
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
        const body = await response.json();
        const messages = Array.isArray(body) ? body : body?.data;
        if (Array.isArray(messages)) return messages;
        throw new Error("OpenCode returned an invalid session transcript.");
      }
      if (response.status !== 404 && response.status !== 200) lastError = new Error(`OpenCode transcript request failed (${response.status}).`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Could not load the OpenCode transcript.");
}

export async function waitForSessionIdle(sessionId, directory, previousAssistantId = null, timeoutMs = 45000) {
  const headers = getAuthHeaders(directory);
  const deadline = Date.now() + timeoutMs;

  await delay(600);

  while (Date.now() < deadline) {
    try {
      const messages = await listOpenCodeMessages(sessionId, directory);
      if (Array.isArray(messages) && messages.length > 0) {
        // OpenCode transcripts have the most recent messages first
        const latestAssistant = messages.find(
          (m) => (m?.info?.role || m?.role || m?.type || m?.info?.type) === "assistant"
        );
        if (latestAssistant) {
          const info = latestAssistant.info || latestAssistant;
          const currentId = info.id || latestAssistant.id;

          // Must be a NEW message, not the previous turn's response
          const isNewMessage = !previousAssistantId || currentId !== previousAssistantId;
          const completed = info.time?.completed != null;
          const parts = latestAssistant.parts || latestAssistant.content;
          const hasText = Array.isArray(parts)
            ? parts.some((p) => p.type === "text" && typeof p.text === "string" && p.text.trim())
            : typeof latestAssistant.text === "string" && latestAssistant.text.trim();

          if (isNewMessage && completed && hasText) {
            return true;
          }
        }
      }
    } catch {}

    await delay(350);
  }
  return false;
}

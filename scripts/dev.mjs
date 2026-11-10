import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const openCodePort = Number(process.env.OPENCODE_PORT ?? 4096);
const openCodeBaseUrl = `http://${host}:${openCodePort}`;
const openCodeUsername = "opencode";
const openCodePassword = process.env.OPENCODE_SERVER_PASSWORD ?? randomBytes(32).toString("hex");
const openCodeAuth = `Basic ${Buffer.from(`${openCodeUsername}:${openCodePassword}`).toString("base64")}`;
const openCodeBin = process.platform === "win32"
  ? path.join(process.env.APPDATA ?? "", "npm", "node_modules", "@opencode", "cli", "bin", "opencode.exe")
  : "opencode";
const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
let openCodeProcess;
let nextProcess;
let ownsOpenCodeProcess = false;

async function getOpenCodeHealth() {
  try {
    const response = await fetch(`${openCodeBaseUrl}/api/provider`, {
      headers: { Authorization: openCodeAuth },
      signal: AbortSignal.timeout(1000),
    });
    if (!response.ok) return null;
    const result = await response.json();
    return result ? { healthy: true, version: "OpenCode v2" } : null;
  } catch {
    return null;
  }
}

async function waitForOpenCode(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const health = await getOpenCodeHealth();
    if (health) return health;
    if (openCodeProcess?.exitCode !== null && openCodeProcess?.exitCode !== undefined) {
      throw new Error(`OpenCode exited with code ${openCodeProcess.exitCode}.`);
    }
    await delay(250);
  }
  throw new Error(`OpenCode did not become ready at ${openCodeBaseUrl}.`);
}

async function startOpenCode() {
  const existing = await getOpenCodeHealth();
  if (existing) {
    console.log(`Using existing OpenCode server ${existing.version} at ${openCodeBaseUrl}`);
    return;
  }

  openCodeProcess = spawn(openCodeBin, ["serve", "--hostname", host, "--port", String(openCodePort)], {
    stdio: "inherit",
    shell: false,
    windowsHide: true,
    env: {
      ...process.env,
      OPENCODE_SERVER_USERNAME: openCodeUsername,
      OPENCODE_SERVER_PASSWORD: openCodePassword,
    },
  });
  ownsOpenCodeProcess = true;
  openCodeProcess.once("error", (error) => {
    console.error(`Could not start OpenCode: ${error.message}`);
  });

  const health = await waitForOpenCode();
  console.log(`OpenCode ${health.version} is ready at ${openCodeBaseUrl}`);
}

function stopChild(child) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  if (process.platform === "win32" && child.pid) {
    return new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore", windowsHide: true });
      killer.once("error", resolve);
      killer.once("exit", resolve);
    });
  }
  return new Promise((resolve) => {
    child.once("exit", resolve);
    child.kill("SIGTERM");
  });
}

let shuttingDown = false;
async function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  await stopChild(nextProcess);
  if (ownsOpenCodeProcess) await stopChild(openCodeProcess);
  process.exitCode = exitCode;
}

try {
  await startOpenCode();
  nextProcess = spawn(process.execPath, [nextBin, "dev"], {
    stdio: "inherit",
    env: {
      ...process.env,
      OPENCODE_BASE_URL: openCodeBaseUrl,
      OPENCODE_SERVER_USERNAME: openCodeUsername,
      OPENCODE_SERVER_PASSWORD: openCodePassword,
    },
    windowsHide: true,
  });

  nextProcess.once("error", (error) => {
    console.error(`Could not start Next.js: ${error.message}`);
    shutdown(1);
  });
  nextProcess.once("exit", (code) => shutdown(code ?? 0));
  process.once("SIGINT", () => void shutdown(0));
  process.once("SIGTERM", () => void shutdown(0));
} catch (error) {
  console.error(error.message);
  if (ownsOpenCodeProcess) await stopChild(openCodeProcess);
  process.exitCode = 1;
}

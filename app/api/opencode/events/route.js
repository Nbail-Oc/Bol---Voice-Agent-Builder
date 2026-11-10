import { getAuthHeaders } from "../../../../lib/opencode.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.OPENCODE_BASE_URL ?? "http://127.0.0.1:28894";
  const authHeaders = getAuthHeaders();

  const headers = {
    Accept: "text/event-stream",
    ...authHeaders,
  };

  let openCodeResponse;
  try {
    for (const endpoint of ["/api/event", "/api/global/event", "/global/event", "/event"]) {
      openCodeResponse = await fetch(`${baseUrl}${endpoint}`, { headers, cache: "no-store" });
      if (openCodeResponse.ok && openCodeResponse.body && openCodeResponse.headers.get("content-type")?.includes("text/event-stream")) break;
      if (openCodeResponse.status !== 404) break;
    }
  } catch (err) {
    return new Response(
      `data: ${JSON.stringify({ type: "error", error: "OpenCode SSE unreachable: " + err.message })}\n\n`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      },
    );
  }

  if (!openCodeResponse.ok || !openCodeResponse.body || !openCodeResponse.headers.get("content-type")?.includes("text/event-stream")) {
    return new Response(
      `data: ${JSON.stringify({ type: "error", error: "OpenCode SSE returned status " + openCodeResponse.status })}\n\n`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      },
    );
  }

  return new Response(openCodeResponse.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

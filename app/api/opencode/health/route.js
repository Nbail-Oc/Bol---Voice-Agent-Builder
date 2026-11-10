import { NextResponse } from "next/server";
import { getOpenCodeHealth } from "../../../../lib/opencode.js";

export const runtime = "nodejs";

export async function GET() {
  try {
    const health = await getOpenCodeHealth();

    return NextResponse.json({
      healthy: true,
      version: health.version,
      availableProviders: health.providers,
    });
  } catch (error) {
    return NextResponse.json(
      { healthy: false, error: error instanceof Error ? error.message : "OpenCode is unavailable." },
      { status: 503 },
    );
  }
}

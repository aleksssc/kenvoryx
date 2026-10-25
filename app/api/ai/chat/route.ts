import { NextResponse } from "next/server";
import { getOrganizationContext } from "@/lib/organization-context";
import { getRedis } from "@/lib/realtime/redis";
import { answerAiChat } from "@/lib/ai/assistant";

export const runtime = "nodejs";
export const maxDuration = 60;

const noCache = { "Cache-Control": "private, no-store" };
type UserMessage = { role: "user" | "assistant"; content: string };

function validMessages(input: unknown): input is UserMessage[] {
  return Array.isArray(input) && input.length > 0 && input.length <= 16
    && input.every((item) => item && typeof item === "object"
      && (item.role === "user" || item.role === "assistant")
      && typeof item.content === "string" && item.content.trim().length > 0 && item.content.length <= 2_000)
    && input[input.length - 1]?.role === "user";
}

export async function POST(request: Request) {
  const { user, organization } = await getOrganizationContext();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401, headers: noCache });
  if (!organization) return NextResponse.json({ error: "ORGANIZATION_REQUIRED" }, { status: 403, headers: noCache });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI_NOT_CONFIGURED" }, { status: 503, headers: noCache });

  // The browser request must originate from this application; cookies supply the authenticated identity.
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return NextResponse.json({ error: "FORBIDDEN_ORIGIN" }, { status: 403, headers: noCache });
      }
    } catch {
      return NextResponse.json({ error: "FORBIDDEN_ORIGIN" }, { status: 403, headers: noCache });
    }
  }

  let input: unknown;
  try { input = await request.json(); } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400, headers: noCache });
  }
  if (!input || typeof input !== "object" || Array.isArray(input) || !validMessages((input as { messages?: unknown }).messages)) {
    return NextResponse.json({ error: "INVALID_MESSAGES" }, { status: 400, headers: noCache });
  }
  const history = (input as { messages: UserMessage[] }).messages;

  try {
    // Fail closed when Redis is unavailable: avoids unbounded paid model usage.
    const redis = getRedis();
    const key = `kenvoryx:ai:rate:${organization.id}:${user.id}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60);
    if (count > 12) return NextResponse.json({ error: "AI_RATE_LIMITED" }, { status: 429, headers: noCache });

    const result = await answerAiChat(organization.id, organization.name, history);
    return NextResponse.json(result, { headers: noCache });
  } catch (error) {
    const code = error instanceof Error ? error.message : "AI_UNAVAILABLE";
    if (code !== "AI_PROVIDER_UNAVAILABLE" && code !== "AI_NOT_CONFIGURED") {
      console.error("[KenvoryX AI] Request failed:", error instanceof Error ? error.name : "unknown");
    }
    return NextResponse.json({ error: code === "AI_PROVIDER_UNAVAILABLE" ? code : "AI_UNAVAILABLE" }, {
      status: 503, headers: noCache,
    });
  }
}

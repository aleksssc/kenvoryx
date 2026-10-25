# KenvoryX AI

The AI workspace is available at `/dashboard/ai`, above **Tools** in desktop/mobile navigation.

## Setup

Add `OPENAI_API_KEY` to your server-only environment (local and Vercel). Never prefix it with `NEXT_PUBLIC_`. Optional: `KENVORYX_AI_MODEL` (defaults to `gpt-4.1-mini`). Existing Supabase, Upstash Redis and realtime agent configuration remains required.

## Architecture

- `components/dashboard/ai/ai-workspace.tsx` – chat UI, proposed-action cards and manual approvals.
- `app/dashboard/ai/page.tsx` – authenticated dashboard page.
- `app/api/ai/chat/route.ts` – authenticated, origin-checked, rate-limited chat API.
- `lib/ai/assistant.ts` – OpenAI tool calling and operating constraints.
- `lib/ai/tools.ts` – scoped, allowlisted reads and action proposal authorization.
- `lib/ai/types.ts` – shared message/proposal contracts.
- Existing `/api/devices/[deviceId]/commands` handles approved actions with its entitlement, device checks, auditing and agent dispatch.

## Safety and limitations

The first release offers **read-only infrastructure questions** and approval-only `force_inventory`, `flush_dns`, `gpupdate`, `restart_agent`. Actions are not automatic. Each action requests explicit confirmation and the server rechecks privileges. Command submission does **not** mean confirmed success; device Activity contains execution results.

The agent does **not** currently support fixing printer services, arbitrary shell or script execution, software installs, RDP troubleshooting, live diagnostics or password resets from AI. These require separate, reviewed capabilities. Chat history is held only in the current browser component and is not persisted to the database.

## Deployment checklist

1. Set `OPENAI_API_KEY` in Vercel (and optional model override).
2. Build and run existing tests; check styling on mobile and desktop.
3. Verify members can read only their permitted organization data.
4. Verify denied roles cannot execute actions; test offline device and remote-access-disabled policy.
5. Test approval, failed commands, retry, rate limits and provider outage.
6. Track provider spend and implement organization quotas/billing before public release.

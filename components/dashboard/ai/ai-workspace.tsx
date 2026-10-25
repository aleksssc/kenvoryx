"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { BrainCircuit, Check, CircleAlert, Loader2, Plus, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import type { AiChatMessage, AiChatResponse, AiProposal } from "@/lib/ai/types";

const WELCOME = [
  "Which devices are currently offline?",
  "List the devices of a client.",
  "Help me diagnose a DNS problem.",
  "Check the inventory of a computer.",
];
const ERROR_TEXT: Record<string, string> = {
  AI_NOT_CONFIGURED: "OpenAI is not configured on this deployment. Set OPENAI_API_KEY in Vercel.",
  AI_RATE_LIMITED: "You've reached the temporary request limit. Try again shortly.",
  AI_PROVIDER_UNAVAILABLE: "The AI provider is currently unavailable.",
  UNAUTHORIZED: "Your session has expired. Sign in again.",
  ORGANIZATION_REQUIRED: "Select an organization first.",
};
const makeId = () => crypto.randomUUID();

function ActionProposal({ proposal }: { proposal: AiProposal }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [detail, setDetail] = useState("");

  async function approve() {
    if (!window.confirm(`Approve "${proposal.label}" on ${proposal.deviceName}?\n\n${proposal.warning}`)) return;
    setState("sending");
    setDetail("");
    try {
      const response = await fetch(`/api/devices/${encodeURIComponent(proposal.deviceId)}/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ command_type: proposal.action, idempotency_key: makeId() }),
      });
      const payload: { commandId?: string; error?: string } = await response.json();
      if (!response.ok || !payload.commandId) throw new Error(payload.error || "Command request failed");
      setState("sent");
      setDetail(`Command ${payload.commandId} submitted. Execution is not yet confirmed; check Device Activity.`);
    } catch (error) {
      setState("failed");
      setDetail(error instanceof Error ? error.message : "Command could not be sent.");
    }
  }

  return <div className="mt-3 rounded-xl border border-surface-edge bg-surface-inset p-3">
    <div className="flex items-start gap-2">
      <ShieldCheck size={17} className="mt-0.5 shrink-0 text-amber-300" />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-zinc-100">{proposal.label}</div>
        <p className="mt-1 break-words text-xs text-surface-muted">{proposal.deviceName} · {proposal.warning}</p>
      </div>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" disabled={state === "sending" || state === "sent"} onClick={() => void approve()}
        className="sg-button sg-button-secondary text-xs">
        {state === "sending" ? <Loader2 size={14} className="animate-spin" /> : state === "sent" ? <Check size={14} /> : <ShieldCheck size={14} />}
        {state === "sent" ? "Command submitted" : state === "sending" ? "Submitting..." : "Review & approve"}
      </button>
      {state === "failed" && <button type="button" className="text-xs text-surface-muted hover:text-white" onClick={() => setState("idle")}>Retry</button>}
    </div>
    {detail && <p role="status" className={`mt-2 break-all text-xs ${state === "failed" ? "text-red-300" : "text-surface-muted"}`}>{detail}</p>}
  </div>;
}

export default function AiWorkspace({ organizationId }: { organizationId: string }) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    controller.current?.abort();
    setMessages([]);
    setError("");
    setInput("");
    setBusy(false);
  }, [organizationId]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, busy]);

  function reset() {
    controller.current?.abort();
    controller.current = null;
    setMessages([]);
    setInput("");
    setError("");
    setBusy(false);
  }

  async function send(value: string) {
    const content = value.trim();
    if (!content || busy || content.length > 2000) return;
    const next: AiChatMessage[] = [...messages, { id: makeId(), role: "user", content }];
    setMessages(next);
    setInput("");
    setError("");
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "same-origin", cache: "no-store",
        body: JSON.stringify({ messages: next.slice(-16).map(({ role, content: text }) => ({ role, content: text })) }),
        signal: abort.signal,
      });
      const result: AiChatResponse & { error?: string } = await response.json();
      if (!response.ok) throw new Error(ERROR_TEXT[result.error ?? ""] || result.error || "Unable to contact KenvoryX AI.");
      if (!abort.signal.aborted) {
        setMessages((current) => [...current, {
          id: makeId(), role: "assistant", content: result.reply,
          proposals: Array.isArray(result.proposals) ? result.proposals : [],
        }]);
      }
    } catch (cause) {
      if (!abort.signal.aborted) setError(cause instanceof Error ? cause.message : "Request failed.");
    } finally {
      if (!abort.signal.aborted) { setBusy(false); controller.current = null; }
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }
  function handleKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(input);
    }
  }

  return <section aria-label="KenvoryX AI chat" className="sg-surface flex h-[min(740px,calc(100dvh-210px))] min-h-[420px] flex-col overflow-hidden">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-edge px-4 py-3 sm:px-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100"><BrainCircuit size={18} className="text-surface-muted" /> Assistant
        <span className="rounded-full border border-surface-edge px-2 py-0.5 text-[10px] font-normal text-surface-muted">Approval required for actions</span>
      </div>
      <button type="button" onClick={reset} className="sg-button sg-button-secondary text-xs"><Plus size={14} /> New chat</button>
    </header>

    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-7" aria-live="polite" aria-relevant="additions">
      {messages.length === 0 && <div className="mx-auto flex max-w-xl flex-col items-center gap-4 pt-6 text-center sm:pt-14">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-edge bg-surface-inset"><Sparkles size={23} className="text-zinc-200" /></div>
        <div><h2 className="text-xl font-semibold tracking-tight text-white">How can I help with your infrastructure?</h2>
          <p className="mt-2 text-sm leading-6 text-surface-muted">Ask about devices, availability and troubleshooting. Maintenance commands always require your approval.</p>
        </div>
        <div className="mt-3 grid w-full gap-2 sm:grid-cols-2">{WELCOME.map((suggestion) => <button key={suggestion} type="button"
          className="rounded-xl border border-surface-edge bg-surface-inset p-3 text-left text-xs leading-5 text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          onClick={() => void send(suggestion)} disabled={busy}>{suggestion}</button>)}</div>
      </div>}
      {messages.map((message) => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[80%] ${message.role === "user"
          ? "border border-surface-edge bg-surface-raised text-zinc-100"
          : "border border-surface-edge bg-surface-inset text-zinc-200"}`}>
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
          {message.proposals?.map((proposal) => <ActionProposal key={proposal.deviceId + proposal.action} proposal={proposal} />)}
        </div>
      </div>)}
      {busy && <div className="flex items-center gap-2 text-xs text-surface-muted"><Loader2 size={15} className="animate-spin" /> Analyzing your request...</div>}
      <div ref={bottom} />
    </div>

    <footer className="border-t border-surface-edge bg-surface-inset/50 p-3 sm:p-4">
      {error && <div role="alert" className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-red-800/40 bg-red-950/20 px-3 py-2 text-xs text-red-200">
        <span className="flex items-start gap-2"><CircleAlert size={15} className="shrink-0" />{error}</span>
        <button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X size={14} /></button>
      </div>}
      <form onSubmit={submit} className="flex items-end gap-3 rounded-xl border border-surface-edge bg-surface-inset p-2 focus-within:border-zinc-500">
        <textarea aria-label="Message to KenvoryX AI" rows={2} maxLength={2000} value={input}
          onChange={(event) => setInput(event.target.value)} onKeyDown={handleKey}
          placeholder="Describe an issue or ask about your devices..." disabled={busy}
          className="max-h-32 min-h-[52px] flex-1 resize-none bg-transparent p-2 text-sm text-zinc-100 outline-none placeholder:text-surface-muted" />
        <button type="submit" aria-label="Send message" disabled={busy || !input.trim()}
          className="sg-button sg-button-primary mb-1 h-10 w-10 justify-center p-0 disabled:opacity-40">
          {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
        </button>
      </form>
      <p className="mt-2 text-center text-[11px] text-surface-muted">AI responses may be inaccurate. Verify diagnoses and review every proposed action.</p>
    </footer>
  </section>;
}

import "server-only";

import { createClient } from "@/lib/supabase/server";
import { commandContext, quickActionAvailability } from "@/lib/remote/commands";
import { AI_SAFE_ACTIONS, type AiProposal, type AiSafeAction } from "./types";

/** Tool definitions are explicit allowlists; the language model never receives SQL or shell access. */
export const AI_TOOLS = [
  { type: "function", function: { name: "list_clients", description: "List customers in the active organization.", parameters: { type: "object", properties: {}, additionalProperties: false } } },
  { type: "function", function: { name: "list_devices", description: "List devices and online states in the active organization. Optionally narrow by client ID or hostname.", parameters: { type: "object", properties: { client_id: { type: "string" }, search: { type: "string" } }, additionalProperties: false } } },
  { type: "function", function: { name: "inspect_device", description: "Read current inventory and last known telemetry for one device ID. This does not perform a fresh live probe.", parameters: { type: "object", properties: { device_id: { type: "string" } }, required: ["device_id"], additionalProperties: false } } },
  { type: "function", function: { name: "prepare_device_action", description: "Propose a permitted maintenance action for a device. NEVER executes it. User must explicitly approve in the interface.", parameters: { type: "object", properties: { device_id: { type: "string" }, action: { type: "string", enum: [...AI_SAFE_ACTIONS] } }, required: ["device_id", "action"], additionalProperties: false } } },
] as const;

const UUID = /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i;
const ACTION_LABELS: Record<AiSafeAction, string> = {
  force_inventory: "Refresh device inventory",
  flush_dns: "Flush DNS cache",
  gpupdate: "Refresh Group Policy",
  restart_agent: "Restart KenvoryX Agent",
};

type ClientRow = { id: string; name: string };
type DeviceRow = {
  id: string; client_id: string; hostname: string; display_name: string | null;
  status: string | null; last_seen: string | null; os: string | null;
  local_ip: string | null; public_ip: string | null; agent_version: string | null;
  cpu_usage: number | null; ram_usage: number | null; disk_usage: number | null;
  uptime_seconds: number | null; capabilities: Record<string, boolean> | null;
};

export type AiToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };
export type AiToolResult = { content: string; proposal?: AiProposal };

function toJson(value: unknown): AiToolResult {
  return { content: JSON.stringify(value) };
}

async function clientsForOrganization(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clients")
    .select("id, name").eq("organization_id", organizationId).order("name").limit(200);
  if (error) throw new Error("AI_CLIENTS_UNAVAILABLE");
  return (data ?? []) as ClientRow[];
}

async function scopedDevice(organizationId: string, deviceId: string) {
  if (!UUID.test(deviceId)) return null;
  const clients = await clientsForOrganization(organizationId);
  const client = new Map(clients.map((item) => [item.id, item]));
  const supabase = await createClient();
  const { data, error } = await supabase.from("devices")
    .select("id, client_id, hostname, display_name, status, last_seen, os, local_ip, public_ip, agent_version, cpu_usage, ram_usage, disk_usage, uptime_seconds, capabilities")
    .eq("id", deviceId).maybeSingle();
  if (error) throw new Error("AI_DEVICE_UNAVAILABLE");
  if (!data || !client.has(data.client_id)) return null;
  return { device: data as DeviceRow, client: client.get(data.client_id)! };
}

/** Server-verified tool dispatcher. AI output is not treated as authorization. */
export async function executeAiTool(organizationId: string, call: AiToolCall): Promise<AiToolResult> {
  let args: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(call.function.arguments || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return toJson({ error: "Invalid tool arguments" });
    args = parsed as Record<string, unknown>;
  } catch {
    return toJson({ error: "Invalid tool arguments" });
  }

  if (call.function.name === "list_clients") {
    return toJson({ clients: await clientsForOrganization(organizationId) });
  }

  if (call.function.name === "list_devices") {
    const clients = await clientsForOrganization(organizationId);
    const allowed = typeof args.client_id === "string"
      ? clients.filter((client) => client.id === args.client_id)
      : clients;
    if (!allowed.length) return toJson({ devices: [] });
    const supabase = await createClient();
    const { data, error } = await supabase.from("devices")
      .select("id, client_id, hostname, display_name, status, last_seen")
      .in("client_id", allowed.map((client) => client.id)).order("hostname").limit(200);
    if (error) throw new Error("AI_DEVICE_UNAVAILABLE");
    const names = new Map(allowed.map((client) => [client.id, client.name]));
    const search = typeof args.search === "string" ? args.search.trim().slice(0, 80).toLowerCase() : "";
    const devices = (data ?? []).filter((device) => !search || (device.display_name || device.hostname).toLowerCase().includes(search))
      .slice(0, 60).map((device) => ({
        id: device.id, name: device.display_name || device.hostname,
        client: names.get(device.client_id), status: device.status, last_seen: device.last_seen,
      }));
    return toJson({ devices, truncated: (data?.length ?? 0) >= 200 });
  }

  if (call.function.name === "inspect_device") {
    const entry = typeof args.device_id === "string" ? await scopedDevice(organizationId, args.device_id) : null;
    if (!entry) return toJson({ error: "Device not found in active organization" });
    const lastSeen = Date.parse(entry.device.last_seen ?? "");
    const online = Number.isFinite(lastSeen) && Date.now() - lastSeen <= 90_000;
    return toJson({ client: entry.client.name, device: { ...entry.device, online } });
  }

  if (call.function.name === "prepare_device_action") {
    const type = args.action;
    if (typeof type !== "string" || !AI_SAFE_ACTIONS.includes(type as AiSafeAction)) {
      return toJson({ error: "Unsupported action. No command has been run." });
    }
    const entry = typeof args.device_id === "string" ? await scopedDevice(organizationId, args.device_id) : null;
    if (!entry) return toJson({ error: "Device not found in active organization" });
    // commandContext checks the role, subscription entitlement and device ownership.
    try {
      const context = await commandContext(entry.device.id);
      if (context.organization.id !== organizationId) return toJson({ error: "Not permitted" });
      const reasons = await quickActionAvailability(entry.device.id);
      if (reasons[type as AiSafeAction]) return toJson({ error: reasons[type as AiSafeAction], executed: false });
    } catch {
      return toJson({ error: "No permission to propose commands or device unavailable", executed: false });
    }
    const action = type as AiSafeAction;
    const proposal: AiProposal = {
      deviceId: entry.device.id,
      deviceName: entry.device.display_name || entry.device.hostname,
      action,
      label: ACTION_LABELS[action],
      warning: action === "restart_agent"
        ? "The agent will disconnect briefly. Confirm that you want to restart it."
        : action === "gpupdate"
          ? "Group Policy refresh may affect device configuration."
          : "This action will run on the selected device after your approval.",
    };
    return { content: JSON.stringify({ proposed: true, executed: false, action: proposal }), proposal };
  }

  return toJson({ error: "Tool not supported" });
}

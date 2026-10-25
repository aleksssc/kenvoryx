/** Public client/server contract. Never put credentials or raw agent tokens here. */
export const AI_SAFE_ACTIONS = ["force_inventory", "flush_dns", "gpupdate", "restart_agent"] as const;
export type AiSafeAction = (typeof AI_SAFE_ACTIONS)[number];

export type AiProposal = {
  deviceId: string;
  deviceName: string;
  action: AiSafeAction;
  label: string;
  warning: string;
};

export type AiChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposals?: AiProposal[];
};

export type AiChatResponse = {
  reply: string;
  proposals: AiProposal[];
};

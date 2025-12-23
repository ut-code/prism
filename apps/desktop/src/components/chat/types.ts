export type Selection =
  | { type: "top" }
  | { type: "chat"; selectedChannelId: string }
  | { type: "personalization" };

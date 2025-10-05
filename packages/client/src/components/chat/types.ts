import type { Id } from "@packages/convex";

export type Selection =
  | { type: "top" }
  | { type: "chat"; selectedChannelId: Id<"channels"> }
  | { type: "personalization" };

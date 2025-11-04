import type { Id } from "@apps/convex";

export type Selection =
  | { type: "top" }
  | { type: "chat"; selectedChannelId: Id<"channels"> }
  | { type: "personalization" };

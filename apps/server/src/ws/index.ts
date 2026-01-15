import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../db/index.ts";
import { channels } from "../db/schema.ts";
import { requireOrganizationMembership } from "../domains/organizations/permissions.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { wsManager } from "./manager.ts";
import type { WsConnection } from "./types.ts";

/**
 * WebSocket routes for real-time communication.
 * Handles channel subscriptions and broadcasts events to connected clients.
 */
const wsClientMessage = t.Union([
  t.Object({ type: t.Literal("subscribe"), channelId: t.String() }),
  t.Object({ type: t.Literal("unsubscribe"), channelId: t.String() }),
  t.Object({ type: t.Literal("ping") }),
]);

const wsMessage = t.Object({
  id: t.String(),
  channelId: t.String(),
  content: t.String(),
  author: t.String(),
  userId: t.String(),
  parentId: t.Nullable(t.String()),
  voteId: t.Nullable(t.String()),
  pinnedAt: t.Nullable(t.Date()),
  pinnedBy: t.Nullable(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  editedAt: t.Nullable(t.Date()),
});

const wsReaction = t.Object({
  id: t.String(),
  messageId: t.String(),
  userId: t.String(),
  emoji: t.String(),
  createdAt: t.Date(),
});

const wsServerMessage = t.Union([
  t.Object({ type: t.Literal("subscribed"), channelId: t.String() }),
  t.Object({ type: t.Literal("unsubscribed"), channelId: t.String() }),
  t.Object({ type: t.Literal("pong") }),
  t.Object({ type: t.Literal("error"), message: t.String() }),
  t.Object({
    type: t.Literal("message:created"),
    channelId: t.String(),
    message: wsMessage,
  }),
  t.Object({
    type: t.Literal("message:updated"),
    channelId: t.String(),
    messageId: t.String(),
    message: wsMessage,
  }),
  t.Object({
    type: t.Literal("message:deleted"),
    channelId: t.String(),
    messageId: t.String(),
  }),
  t.Object({
    type: t.Literal("reaction:added"),
    channelId: t.String(),
    messageId: t.String(),
    reaction: wsReaction,
  }),
  t.Object({
    type: t.Literal("reaction:removed"),
    channelId: t.String(),
    messageId: t.String(),
    emoji: t.String(),
    userId: t.String(),
  }),
]);

export const wsRoutes = new Elysia().use(authMiddleware).ws("/ws", {
  body: wsClientMessage,
  response: wsServerMessage,

  open(ws) {
    const user = ws.data.user;
    if (!user) {
      ws.close();
      return;
    }

    const conn: WsConnection = {
      id: crypto.randomUUID(),
      user,
      channels: new Set(),
    };

    wsManager.addConnection(conn.id, ws, conn);
    ws.subscribe("global");
  },

  async message(ws, msg) {
    const user = ws.data.user;
    if (!user) return;

    if (msg.type === "subscribe") {
      const connections = Array.from(wsManager.connections.values());
      const conn = connections.find((c) => c.user.id === user.id);
      if (!conn) return;

      // Lookup channel to verify organization membership
      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, msg.channelId))
        .limit(1);

      if (!channel) {
        ws.send({ type: "error", message: "Channel not found" });
        return;
      }

      // Verify user is a member of the channel's organization
      try {
        await requireOrganizationMembership(user.id, channel.organizationId);
      } catch {
        ws.send({
          type: "error",
          message: "Not authorized to access this channel",
        });
        return;
      }

      wsManager.subscribe(conn.id, msg.channelId);
      ws.send({ type: "subscribed", channelId: msg.channelId });
    } else if (msg.type === "unsubscribe") {
      const connections = Array.from(wsManager.connections.values());
      const conn = connections.find((c) => c.user.id === user.id);
      if (conn) {
        wsManager.unsubscribe(conn.id, msg.channelId);
        ws.send({ type: "unsubscribed", channelId: msg.channelId });
      }
    } else if (msg.type === "ping") {
      ws.send({ type: "pong" });
    }
  },

  close(ws) {
    const user = ws.data.user;
    if (!user) return;

    const connections = Array.from(wsManager.connections.values());
    const conn = connections.find((c) => c.user.id === user.id);
    if (conn) {
      wsManager.removeConnection(conn.id);
    }
  },
});

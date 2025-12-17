import { Elysia, t } from "elysia";
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

export const wsRoutes = new Elysia().use(authMiddleware).ws("/ws", {
  body: wsClientMessage,

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

  message(ws, msg) {
    const user = ws.data.user;
    if (!user) return;

    if (msg.type === "subscribe") {
      const connections = Array.from(wsManager.connections.values());
      const conn = connections.find((c) => c.user.id === user.id);
      if (conn) {
        wsManager.subscribe(conn.id, msg.channelId);
        ws.send({ type: "subscribed", channelId: msg.channelId });
      }
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

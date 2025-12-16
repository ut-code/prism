import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth.ts";
import { wsManager } from "./manager.ts";
import type { WsClientMessage, WsConnection } from "./types.ts";

/**
 * WebSocket routes for real-time communication.
 * Handles channel subscriptions and broadcasts events to connected clients.
 */
export const wsRoutes = new Elysia().use(authMiddleware).ws("/ws", {
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

    try {
      const data = JSON.parse(String(msg)) as WsClientMessage;

      if (data.type === "subscribe") {
        const connections = Array.from(wsManager.connections.values());
        const conn = connections.find((c) => c.user.id === user.id);
        if (conn) {
          wsManager.subscribe(conn.id, data.channelId);
          ws.send(
            JSON.stringify({ type: "subscribed", channelId: data.channelId }),
          );
        }
      } else if (data.type === "unsubscribe") {
        const connections = Array.from(wsManager.connections.values());
        const conn = connections.find((c) => c.user.id === user.id);
        if (conn) {
          wsManager.unsubscribe(conn.id, data.channelId);
          ws.send(
            JSON.stringify({ type: "unsubscribed", channelId: data.channelId }),
          );
        }
      } else if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
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

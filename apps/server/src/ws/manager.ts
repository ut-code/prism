import type {
  WsBroadcastEvent,
  WsConnection,
  WsServerMessage,
} from "./types.ts";

/**
 * WebSocket instance with send method.
 */
interface WsInstance {
  send: (message: WsServerMessage) => void;
}

/**
 * Manages WebSocket connections and channel subscriptions.
 * Handles broadcasting events to subscribed clients.
 */
export class WsManager {
  // Map: connection ID -> connection metadata
  connections = new Map<string, WsConnection>();
  // Map: connection ID -> WebSocket instance
  private sockets = new Map<string, WsInstance>();

  /**
   * Registers a new connection.
   */
  addConnection(id: string, ws: WsInstance, conn: WsConnection) {
    this.connections.set(id, conn);
    this.sockets.set(id, ws);
  }

  /**
   * Removes a connection.
   */
  removeConnection(id: string) {
    this.connections.delete(id);
    this.sockets.delete(id);
  }

  /**
   * Subscribes a connection to a channel.
   */
  subscribe(connectionId: string, channelId: string) {
    const conn = this.connections.get(connectionId);
    if (conn) {
      conn.channels.add(channelId);
    }
  }

  /**
   * Unsubscribes a connection from a channel.
   */
  unsubscribe(connectionId: string, channelId: string) {
    const conn = this.connections.get(connectionId);
    if (conn) {
      conn.channels.delete(channelId);
    }
  }

  /**
   * Broadcasts an event to all connections subscribed to the channel.
   */
  broadcast(channelId: string, event: WsBroadcastEvent) {
    for (const [id, conn] of this.connections) {
      if (conn.channels.has(channelId)) {
        const ws = this.sockets.get(id);
        ws?.send(event);
      }
    }
  }
}

export const wsManager = new WsManager();

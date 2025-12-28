import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { channels } from "../db/schema.ts";
import { requireOrganizationMembership } from "../domains/organizations/permissions.ts";
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
   * Verifies user has permission (is member of the organization owning the channel).
   * @returns true if subscribed successfully, false if permission denied
   */
  async subscribe(connectionId: string, channelId: string): Promise<boolean> {
    const conn = this.connections.get(connectionId);
    if (!conn) return false;

    // Fetch channel to get organization ID
    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, channelId))
      .limit(1);

    if (!channel) return false;

    // Verify user is member of the organization
    try {
      await requireOrganizationMembership(conn.user.id, channel.organizationId);
    } catch {
      return false;
    }

    conn.channels.add(channelId);
    return true;
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

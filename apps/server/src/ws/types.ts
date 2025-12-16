import type { AuthUser } from "../middleware/auth.ts";

/**
 * WebSocket events that can be broadcast to clients.
 */
export type WsEvent =
  | { type: "message:created"; channelId: string; message: unknown }
  | {
      type: "message:updated";
      channelId: string;
      messageId: string;
      message: unknown;
    }
  | { type: "message:deleted"; channelId: string; messageId: string }
  | {
      type: "reaction:added";
      channelId: string;
      messageId: string;
      reaction: unknown;
    }
  | {
      type: "reaction:removed";
      channelId: string;
      messageId: string;
      emoji: string;
      userId: string;
    };

/**
 * Client-to-server messages.
 */
export type WsClientMessage =
  | { type: "subscribe"; channelId: string }
  | { type: "unsubscribe"; channelId: string }
  | { type: "ping" };

/**
 * WebSocket connection metadata.
 */
export interface WsConnection {
  id: string;
  user: AuthUser;
  channels: Set<string>;
}

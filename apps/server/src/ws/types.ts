import type { AuthUser } from "../middleware/auth.ts";

/**
 * Control messages sent to specific clients.
 */
export type WsControlMessage =
  | { type: "subscribed"; channelId: string }
  | { type: "unsubscribed"; channelId: string }
  | { type: "pong" };

/**
 * Broadcast events sent to channel subscribers.
 */
export type WsBroadcastEvent =
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
 * All server-to-client messages (control + broadcast).
 */
export type WsServerMessage = WsControlMessage | WsBroadcastEvent;

/** @deprecated Use WsBroadcastEvent instead */
export type WsEvent = WsBroadcastEvent;

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

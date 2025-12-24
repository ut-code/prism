import type { AuthUser } from "../middleware/auth.ts";

/**
 * Message object sent in WebSocket events.
 */
export interface WsMessage {
  id: string;
  channelId: string;
  content: string;
  author: string;
  userId: string;
  parentId: string | null;
  voteId: string | null;
  pinnedAt: Date | null;
  pinnedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;
}

/**
 * Reaction object sent in WebSocket events.
 */
export interface WsReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

/**
 * Control messages sent to specific clients.
 */
export type WsControlMessage =
  | { type: "subscribed"; channelId: string }
  | { type: "unsubscribed"; channelId: string }
  | { type: "pong" }
  | { type: "error"; message: string };

/**
 * Broadcast events sent to channel subscribers.
 */
export type WsBroadcastEvent =
  | { type: "message:created"; channelId: string; message: WsMessage }
  | {
      type: "message:updated";
      channelId: string;
      messageId: string;
      message: WsMessage;
    }
  | { type: "message:deleted"; channelId: string; messageId: string }
  | {
      type: "reaction:added";
      channelId: string;
      messageId: string;
      reaction: WsReaction;
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

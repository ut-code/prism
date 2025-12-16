/**
 * WebSocket event types from server.
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
    }
  | { type: "subscribed"; channelId: string }
  | { type: "unsubscribed"; channelId: string }
  | { type: "pong" };

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

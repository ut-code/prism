import type { WsServerMessage } from "@packages/api-client";
import { getWebSocket } from "./index.ts";

type EventType = WsServerMessage["type"];
type EventOfType<T extends EventType> = Extract<WsServerMessage, { type: T }>;

/**
 * Subscribe to a specific WebSocket event type with automatic cleanup.
 *
 * @example
 * ```ts
 * useWebSocket("message:created", (event) => {
 *   console.log(event.channelId, event.message);
 * });
 * ```
 */
export function useWebSocket<T extends EventType>(
  type: T,
  handler: (event: EventOfType<T>) => void,
): void {
  let ws: ReturnType<typeof getWebSocket> | null = null;

  try {
    ws = getWebSocket();
  } catch {
    return;
  }

  const messageHandler = (event: { data: WsServerMessage }) => {
    if (event.data.type === type) {
      handler(event.data as EventOfType<T>);
    }
  };

  $effect(() => {
    ws?.on("message", messageHandler);
    return () => {
      ws?.off("message", messageHandler);
    };
  });
}

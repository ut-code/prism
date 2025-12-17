import { getWebSocket } from "./index.ts";
import type { WsEvent } from "./types.ts";

type EventType = WsEvent["type"];
type EventHandler<T extends EventType> = (
  event: Extract<WsEvent, { type: T }>,
) => void;

/**
 * Subscribe to a WebSocket event with automatic cleanup via $effect.
 *
 * @example
 * ```ts
 * useWebSocket("message:created", (event) => {
 *   console.log("New message:", event.message);
 * });
 * ```
 */
export function useWebSocket<T extends EventType>(
  type: T,
  handler: EventHandler<T>,
): void {
  let ws: ReturnType<typeof getWebSocket> | null = null;

  try {
    ws = getWebSocket();
  } catch {
    console.warn("WebSocket not initialized");
    return;
  }

  const wrappedHandler = (event: WsEvent) => {
    if (event.type === type) {
      handler(event as Extract<WsEvent, { type: T }>);
    }
  };

  $effect(() => {
    ws?.on(type, wrappedHandler);
    return () => {
      ws?.off(type, wrappedHandler);
    };
  });
}

import { onDestroy } from "svelte";
import { getWebSocket } from "./index.ts";
import type { WsEvent } from "./types.ts";

type EventType = WsEvent["type"];
type EventHandler<T extends EventType> = (
  event: Extract<WsEvent, { type: T }>,
) => void;

interface Subscription {
  type: string;
  handler: (event: WsEvent) => void;
}

/**
 * Reactive WebSocket hook with automatic cleanup.
 * Handles event subscriptions and channel management.
 *
 * @example
 * ```ts
 * const ws = useWebSocket();
 *
 * // Subscribe to events (auto-cleanup on destroy)
 * ws.on("message:created", (event) => {
 *   console.log("New message:", event.message);
 * });
 *
 * // Subscribe to a channel
 * ws.subscribe(channelId);
 * ```
 */
export function useWebSocket() {
  const subscriptions: Subscription[] = [];
  const subscribedChannels: string[] = [];

  let ws: ReturnType<typeof getWebSocket> | null = null;

  try {
    ws = getWebSocket();
  } catch {
    console.warn("WebSocket not initialized");
  }

  /**
   * Subscribe to a WebSocket event with automatic cleanup.
   */
  function on<T extends EventType>(type: T, handler: EventHandler<T>) {
    if (!ws) return;

    const wrappedHandler = (event: WsEvent) => {
      if (event.type === type) {
        handler(event as Extract<WsEvent, { type: T }>);
      }
    };

    ws.on(type, wrappedHandler);
    subscriptions.push({ type, handler: wrappedHandler });
  }

  /**
   * Subscribe to a channel.
   */
  function subscribe(channelId: string) {
    if (!ws) return;
    ws.subscribe(channelId);
    subscribedChannels.push(channelId);
  }

  /**
   * Unsubscribe from a channel.
   */
  function unsubscribe(channelId: string) {
    if (!ws) return;
    ws.unsubscribe(channelId);
    const index = subscribedChannels.indexOf(channelId);
    if (index !== -1) subscribedChannels.splice(index, 1);
  }

  // Cleanup on component destroy
  onDestroy(() => {
    if (!ws) return;

    // Remove all event listeners
    for (const { type, handler } of subscriptions) {
      ws.off(type, handler);
    }

    // Unsubscribe from all channels
    for (const channelId of subscribedChannels) {
      ws.unsubscribe(channelId);
    }
  });

  return {
    on,
    subscribe,
    unsubscribe,
    get connected() {
      return ws?.status === "connected";
    },
    get status() {
      return ws?.status ?? "disconnected";
    },
  };
}

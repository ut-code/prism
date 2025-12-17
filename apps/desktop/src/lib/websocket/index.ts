import { createWsClient, type WsClient } from "@apps/api-client";

export type {
  WsBroadcastEvent,
  WsClientMessage,
  WsControlMessage,
  WsServerMessage,
} from "@apps/api-client";

let wsClient: WsClient | null = null;
const subscribedChannels = new Set<string>();

/**
 * Initializes the WebSocket client using Eden Treaty.
 */
export async function setupWebSocket(baseUrl: string) {
  wsClient = await createWsClient({ baseUrl });
  return wsClient;
}

/**
 * Returns the global WebSocket client instance.
 */
export function getWebSocket(): WsClient {
  if (!wsClient) {
    throw new Error("WebSocket not initialized. Call setupWebSocket() first.");
  }
  return wsClient;
}

/**
 * Subscribe to a channel (sends subscribe message to server).
 */
export function subscribeChannel(channelId: string) {
  if (!wsClient) return;
  subscribedChannels.add(channelId);
  wsClient.send({ type: "subscribe", channelId });
}

/**
 * Unsubscribe from a channel.
 */
export function unsubscribeChannel(channelId: string) {
  if (!wsClient) return;
  subscribedChannels.delete(channelId);
  wsClient.send({ type: "unsubscribe", channelId });
}

/**
 * Get currently subscribed channels.
 */
export function getSubscribedChannels(): ReadonlySet<string> {
  return subscribedChannels;
}

export { useWebSocket } from "./useWebSocket.svelte.ts";

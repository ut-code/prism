import { WebSocketClient } from "./client.svelte.ts";

/**
 * Global WebSocket client instance.
 */
let wsClient: WebSocketClient | null = null;

/**
 * Initializes the WebSocket client with the given URL.
 */
export function setupWebSocket(url: string) {
  wsClient = new WebSocketClient(url);
  return wsClient;
}

/**
 * Returns the global WebSocket client instance.
 * Throws an error if setupWebSocket() has not been called.
 */
export function getWebSocket(): WebSocketClient {
  if (!wsClient) {
    throw new Error("WebSocket not initialized. Call setupWebSocket() first.");
  }
  return wsClient;
}

export type { ConnectionStatus, WsEvent } from "./types.ts";

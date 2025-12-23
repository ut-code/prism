/**
 * WebSocket client using Elysia Eden Treaty.
 * Provides type-safe WebSocket connection to the server.
 */

import type { App } from "@apps/server";
import { treaty } from "@elysiajs/eden";

export type {
  WsBroadcastEvent,
  WsClientMessage,
  WsControlMessage,
  WsServerMessage,
} from "@apps/server/ws/types";

export interface WsConfig {
  baseUrl: string;
}

/**
 * Creates a WebSocket connection using Eden Treaty.
 * Returns the WebSocket subscription with typed send/receive methods.
 */
export async function createWsClient(config: WsConfig) {
  const client = treaty<App>(config.baseUrl);
  return client.ws.subscribe();
}

export type WsClient = Awaited<ReturnType<typeof createWsClient>>;

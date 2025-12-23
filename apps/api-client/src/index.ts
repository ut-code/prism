/**
 * API Client using Elysia Eden Treaty.
 * Provides type-safe access to the REST API.
 */

import type { App } from "@apps/server";
import { treaty } from "@elysiajs/eden";

export * from "./route-helpers.ts";
export type * from "./types.ts";
export * from "./ws.ts";

export interface ApiConfig {
  baseUrl: string;
  onUnauthorized?: () => void;
}

/**
 * Creates an API client instance using Eden Treaty.
 * The client provides type-safe access to all API endpoints.
 */
export function createApiClient(config: ApiConfig) {
  return treaty<App>(config.baseUrl, {
    fetch: {
      credentials: "include",
    },
    onResponse: (response) => {
      if (response.status === 401 && config.onUnauthorized) {
        config.onUnauthorized();
      }
    },
  });
}

export type ApiClient = ReturnType<typeof createApiClient>;

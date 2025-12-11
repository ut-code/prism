/**
 * API Client using Elysia Eden Treaty.
 * Provides type-safe access to the REST API.
 */

import type { App } from "@apps/server";
import { treaty } from "@elysiajs/eden";

export * from "./route-helpers";
export type * from "./types";

export interface ApiConfig {
  baseUrl: string;
  fetch?: typeof fetch;
}

/**
 * Creates an API client instance using Eden Treaty.
 * The client provides type-safe access to all API endpoints.
 */
export function createApiClient(config: ApiConfig) {
  return treaty<App>(config.baseUrl);
}

export type ApiClient = ReturnType<typeof createApiClient>;

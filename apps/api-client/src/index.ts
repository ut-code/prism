// API Client using Elysia Eden Treaty

import type { App } from "@apps/server";
import { treaty } from "@elysiajs/eden";

export type * from "./types";

export interface ApiConfig {
  baseUrl: string;
  fetch?: typeof fetch;
}

export function createApiClient(config: ApiConfig) {
  return treaty<App>(config.baseUrl);
}

export type ApiClient = ReturnType<typeof createApiClient>;

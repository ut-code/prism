import {
  type ApiClient,
  createApiClient,
  getChannel,
  getFile,
  getMessage,
  getOrganization,
  getVote,
} from "@packages/api-client";
import { goto } from "$app/navigation";

// Re-export helper functions
export { getChannel, getFile, getMessage, getOrganization, getVote };

// Re-export hooks and utilities
export { type QueryState, useMutation, useQuery } from "./api/hooks.svelte.ts";
export { unwrapResponse } from "./api/utils.ts";

// Global Eden Treaty client instance
let apiClient: ApiClient | null = null;

/**
 * Initializes the API client with the provided base URL.
 * Must be called before using getApiClient() or api().
 */
export function setupApi(baseUrl?: string) {
  const url = baseUrl ?? import.meta.env.PUBLIC_API_BASE_URL;
  if (!url) {
    throw new Error(
      "API base URL is required. Provide baseUrl or set PUBLIC_API_BASE_URL environment variable",
    );
  }
  apiClient = createApiClient({
    baseUrl: url,
    onUnauthorized: () => goto("/signin", { replaceState: true }),
  });
  return apiClient;
}

/**
 * Returns the global API client instance.
 * Throws an error if setupApi() has not been called.
 */
export function getApiClient(): ApiClient {
  if (!apiClient) {
    throw new Error("API client not initialized. Call setupApi() first.");
  }
  return apiClient;
}

/**
 * Type-safe API accessor function.
 */
export const api = () => getApiClient();

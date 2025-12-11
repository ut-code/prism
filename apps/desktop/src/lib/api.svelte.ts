import {
  type ApiClient,
  createApiClient,
  getChannel,
  getFile,
  getMessage,
  getOrganization,
  getTask,
  getVote,
} from "@apps/api-client";
import { untrack } from "svelte";

// Re-export helper functions
export { getChannel, getFile, getMessage, getOrganization, getTask, getVote };

// Global Eden Treaty client instance
let apiClient: ApiClient | null = null;

export function setupApi(baseUrl = "http://localhost:3000") {
  apiClient = createApiClient({ baseUrl });
  return apiClient;
}

export function getApiClient(): ApiClient {
  if (!apiClient) {
    throw new Error("API client not initialized. Call setupApi() first.");
  }
  return apiClient;
}

// Type-safe API accessor
export const api = () => getApiClient();

// Helper to unwrap Eden Treaty responses
export function unwrapResponse<T>(response: {
  data?: T | null;
  error?: { status: number; value: unknown } | null;
}): T {
  if (response.error) {
    throw new Error(
      typeof response.error.value === "string"
        ? response.error.value
        : JSON.stringify(response.error.value),
    );
  }
  if (response.data === undefined || response.data === null) {
    throw new Error("Response data is undefined or null");
  }
  return response.data;
}

// Query state type
export type QueryState<T> =
  | { isLoading: true; error: undefined; data: undefined }
  | { isLoading: false; error: Error; data: undefined }
  | { isLoading: false; error: undefined; data: T };

/**
 * Reactive query hook for API calls
 * Similar to Convex's useQuery but for REST API
 */
export function useQuery<T>(
  fetcher: () => Promise<T>,
  options?: { refetchInterval?: number },
): QueryState<T> {
  let isLoading = $state(true);
  let error = $state<Error | undefined>(undefined);
  let data = $state<T | undefined>(undefined);

  let intervalId: NodeJS.Timeout | undefined;

  async function fetch() {
    isLoading = true;
    error = undefined;
    try {
      const result = await fetcher();
      data = result;
      isLoading = false;
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      isLoading = false;
    }
  }

  $effect(() => {
    fetch();

    if (options?.refetchInterval) {
      intervalId = setInterval(() => {
        untrack(() => fetch());
      }, options.refetchInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  });

  const state = {
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get data() {
      return data;
    },
  };

  return state as QueryState<T>;
}

/**
 * Mutation hook for API calls
 * Similar to Convex's useMutation but for REST API
 */
export function useMutation<TArgs, TResult>(
  mutator: (args: TArgs) => Promise<TResult>,
) {
  let processing = $state(false);
  let error = $state<string | null>(null);

  async function run(args: TArgs): Promise<TResult | undefined> {
    processing = true;
    error = null;
    try {
      const result = await mutator(args);
      processing = false;
      return result;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      processing = false;
      return undefined;
    }
  }

  return {
    run,
    get processing() {
      return processing;
    },
    get error() {
      return error;
    },
  };
}

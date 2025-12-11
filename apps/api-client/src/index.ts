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

// Type-safe dynamic route accessors using Eden Treaty's index signatures
type DynamicRoute<T> = {
  get: () => Promise<{ data?: T; error?: { status: number; value: unknown } }>;
  patch: (
    body?: Partial<T>,
  ) => Promise<{ data?: T; error?: { status: number; value: unknown } }>;
  delete: () => Promise<{
    data?: { success: boolean };
    error?: { status: number; value: unknown };
  }>;
  cast?: {
    post: (body: {
      votedOptions: number[];
    }) => Promise<{ data?: unknown; error?: { status: number; value: unknown } }>;
  };
};

type OrganizationMembersRoute = {
  get: () => Promise<{
    data?: unknown;
    error?: { status: number; value: unknown };
  }>;
  post: (body: {
    userId: string;
    permission: string;
  }) => Promise<{ data?: unknown; error?: { status: number; value: unknown } }>;
} & {
  [userId: string]: {
    delete: () => Promise<{
      data?: unknown;
      error?: { status: number; value: unknown };
    }>;
  };
};

type OrganizationRoute = DynamicRoute<unknown> & {
  members: OrganizationMembersRoute;
};

type MessageReactionsRoute = {
  get: () => Promise<{
    data?: unknown;
    error?: { status: number; value: unknown };
  }>;
  post: (body: {
    emoji: string;
  }) => Promise<{ data?: unknown; error?: { status: number; value: unknown } }>;
} & {
  [emoji: string]: {
    delete: () => Promise<{
      data?: unknown;
      error?: { status: number; value: unknown };
    }>;
  };
};

type MessagesRoute = {
  reactions: MessageReactionsRoute;
};

// Helper functions for type-safe dynamic route access
// Eden Treaty uses Proxy to enable dynamic route access at runtime
// The functions use explicit return type annotations instead of type assertions
export function getOrganization<T extends string>(
  client: ApiClient,
  id: T,
): OrganizationRoute {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.organizations[id];
}

export function getChannel<T extends string>(
  client: ApiClient,
  id: T,
): DynamicRoute<unknown> {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.channels[id];
}

export function getMessage<T extends string>(
  client: ApiClient,
  id: T,
): MessagesRoute {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.messages[id];
}

export function getVote<T extends string>(
  client: ApiClient,
  id: T,
): DynamicRoute<unknown> {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.votes[id];
}

export function getTask<T extends string>(
  client: ApiClient,
  id: T,
): DynamicRoute<unknown> {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.tasks[id];
}

export function getFile<T extends string>(
  client: ApiClient,
  id: T,
): DynamicRoute<unknown> {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.files[id];
}

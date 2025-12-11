import type { ApiClient } from "./index";
import type {
  DynamicRoute,
  MessagesRoute,
  OrganizationRoute,
} from "./route-types";

/**
 * Helper functions for type-safe dynamic route access.
 * Eden Treaty uses Proxy to enable dynamic route access at runtime.
 * The functions use explicit return type annotations instead of type assertions.
 */

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

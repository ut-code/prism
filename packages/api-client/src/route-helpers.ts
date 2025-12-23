import type { ApiClient } from "./index.ts";
import type {
  ChannelRoute,
  FileRoute,
  MessagesRoute,
  OrganizationRoute,
  TaskRoute,
  VoteRoute,
} from "./route-types.ts";

/**
 * Helper functions for type-safe dynamic route access.
 * Eden Treaty uses Proxy to enable dynamic route access at runtime.
 */

export function getOrganization(
  client: ApiClient,
  id: string,
): OrganizationRoute {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.organizations[id];
}

export function getChannel(client: ApiClient, id: string): ChannelRoute {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.channels[id];
}

export function getMessage(client: ApiClient, id: string): MessagesRoute {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.messages[id];
}

export function getVote(client: ApiClient, id: string): VoteRoute {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.votes[id];
}

export function getTask(client: ApiClient, id: string): TaskRoute {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.tasks[id];
}

export function getFile(client: ApiClient, id: string): FileRoute {
  // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
  return client.files[id];
}

import type { ApiClient } from "./index.ts";
import type {
  ChannelRoute,
  FileRoute,
  MessagesRoute,
  OrganizationRoute,
  VoteRoute,
} from "./route-types.ts";

/**
 * Helper functions for type-safe dynamic route access.
 * Eden Treaty uses Proxy to enable dynamic route access at runtime.
 */

type DynamicIndex<T> = Record<string, T>;

export function getOrganization(
  client: ApiClient,
  id: string,
): OrganizationRoute {
  return (client.organizations as unknown as DynamicIndex<OrganizationRoute>)[
    id
  ] as OrganizationRoute;
}

export function getChannel(client: ApiClient, id: string): ChannelRoute {
  return (client.channels as unknown as DynamicIndex<ChannelRoute>)[
    id
  ] as ChannelRoute;
}

export function getMessage(client: ApiClient, id: string): MessagesRoute {
  return (client.messages as unknown as DynamicIndex<MessagesRoute>)[
    id
  ] as MessagesRoute;
}

export function getVote(client: ApiClient, id: string): VoteRoute {
  return (client.votes as unknown as DynamicIndex<VoteRoute>)[id] as VoteRoute;
}

export function getFile(client: ApiClient, id: string): FileRoute {
  return (client.files as unknown as DynamicIndex<FileRoute>)[id] as FileRoute;
}

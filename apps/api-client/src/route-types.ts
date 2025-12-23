/**
 * Type-safe dynamic route accessors using Eden Treaty's index signatures.
 * These types describe the structure of dynamically accessed routes.
 */

import type {
  Channel,
  File,
  Organization,
  Reaction,
  Task,
  Vote,
} from "./types.ts";

type ApiResponse<T> = Promise<{
  data?: T | { message: string } | null;
  error?: { status: unknown; value: unknown } | null;
}>;

export type DynamicRoute<T> = {
  get: () => ApiResponse<T>;
  patch: (body?: Partial<T>) => ApiResponse<T>;
  delete: () => ApiResponse<{ success: boolean }>;
};

export type VoteRoute = DynamicRoute<Vote> & {
  cast?: {
    post: (body: { votedOptions: number[] }) => ApiResponse<Vote>;
  };
};

export type FileRoute = DynamicRoute<File>;

export type TaskRoute = DynamicRoute<Task>;

export type OrganizationMembersRoute = {
  get: () => ApiResponse<unknown>;
  post: (body: { userId: string; permission: string }) => ApiResponse<unknown>;
} & {
  [userId: string]: {
    delete: () => ApiResponse<unknown>;
  };
};

export type OrganizationRoute = DynamicRoute<Organization> & {
  members: OrganizationMembersRoute;
};

export type ChannelRoute = DynamicRoute<Channel>;

export type MessageReactionsRoute = {
  get: () => ApiResponse<Reaction[]>;
  post: (body: { emoji: string }) => ApiResponse<Reaction>;
} & {
  [emoji: string]:
    | {
        delete: () => ApiResponse<{ success: boolean }>;
      }
    | undefined;
};

export type MessagesRoute = {
  reactions: MessageReactionsRoute;
  put: (body: { content: string }) => ApiResponse<unknown>;
  delete: () => ApiResponse<{ success: boolean }>;
};

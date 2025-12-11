/**
 * Type-safe dynamic route accessors using Eden Treaty's index signatures.
 * These types describe the structure of dynamically accessed routes.
 */

export type DynamicRoute<T> = {
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

export type OrganizationMembersRoute = {
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

export type OrganizationRoute = DynamicRoute<unknown> & {
  members: OrganizationMembersRoute;
};

export type MessageReactionsRoute = {
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

export type MessagesRoute = {
  reactions: MessageReactionsRoute;
};

// API Client for Prism Elysia Server
import type {
  Channel,
  File,
  Message,
  Organization,
  OrganizationMember,
  Reaction,
  Task,
  User,
  Vote,
} from "./types";

export type * from "./types";

export interface ApiConfig {
  baseUrl: string;
  fetch?: typeof fetch;
}

export class ApiClient {
  private baseUrl: string;
  private fetchFn: typeof fetch;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.fetchFn = config.fetch || globalThis.fetch;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  auth = {
    me: () => this.request<{ user: User | null }>("/auth/me"),
    signIn: (email: string) =>
      this.request<{ success: boolean; user: User }>("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    signOut: () =>
      this.request<{ success: boolean }>("/auth/signout", {
        method: "POST",
      }),
  };

  // Organizations
  organizations = {
    list: () => this.request<Organization[]>("/organizations"),
    get: (id: string) => this.request<Organization>(`/organizations/${id}`),
    create: (data: { name: string; description?: string }) =>
      this.request<Organization>("/organizations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { name?: string; description?: string }) =>
      this.request<Organization>(`/organizations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    members: {
      list: (organizationId: string) =>
        this.request<OrganizationMember[]>(
          `/organizations/${organizationId}/members`,
        ),
      add: (
        organizationId: string,
        data: { userId: string; role?: string; permission: string },
      ) =>
        this.request<OrganizationMember>(
          `/organizations/${organizationId}/members`,
          {
            method: "POST",
            body: JSON.stringify(data),
          },
        ),
      remove: (organizationId: string, userId: string) =>
        this.request<{ success: boolean }>(
          `/organizations/${organizationId}/members/${userId}`,
          { method: "DELETE" },
        ),
    },
  };

  // Channels
  channels = {
    list: (organizationId: string) =>
      this.request<Channel[]>(`/channels?organizationId=${organizationId}`),
    get: (id: string) => this.request<Channel>(`/channels/${id}`),
    create: (data: {
      name: string;
      description?: string;
      organizationId: string;
    }) =>
      this.request<Channel>("/channels", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Messages
  messages = {
    list: (channelId: string) =>
      this.request<Message[]>(`/messages?channelId=${channelId}`),
    send: (data: {
      channelId: string;
      content: string;
      author: string;
      parentId?: string;
      attachments?: string[];
      voteId?: string;
    }) =>
      this.request<Message>("/messages", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    reactions: {
      list: (messageId: string) =>
        this.request<Reaction[]>(`/messages/${messageId}/reactions`),
      add: (messageId: string, emoji: string) =>
        this.request<Reaction>(`/messages/${messageId}/reactions`, {
          method: "POST",
          body: JSON.stringify({ emoji }),
        }),
      remove: (messageId: string, emoji: string) =>
        this.request<{ success: boolean }>(
          `/messages/${messageId}/reactions/${emoji}`,
          { method: "DELETE" },
        ),
    },
  };

  // Users
  users = {
    me: () => this.request<User | null>("/users/me"),
    getNames: (userIds: string[]) =>
      this.request<Record<string, string>>("/users/names", {
        method: "POST",
        body: JSON.stringify({ userIds }),
      }),
    getNicknames: (userIds: string[], organizationId: string) =>
      this.request<Record<string, string>>("/users/nicknames", {
        method: "POST",
        body: JSON.stringify({ userIds, organizationId }),
      }),
    search: (email: string) =>
      this.request<User[]>(`/users/search?email=${email}`),
  };

  // Files
  files = {
    list: (organizationId: string, limit?: number) =>
      this.request<File[]>(
        `/files?organizationId=${organizationId}${limit ? `&limit=${limit}` : ""}`,
      ),
    get: (id: string) => this.request<File>(`/files/${id}`),
    create: (data: {
      storageId: string;
      filename: string;
      originalFilename: string;
      mimeType: string;
      size: number;
      organizationId: string;
      width?: number;
      height?: number;
    }) =>
      this.request<File>("/files", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request<{ success: boolean }>(`/files/${id}`, {
        method: "DELETE",
      }),
  };

  // Tasks
  tasks = {
    list: () => this.request<Task[]>("/tasks"),
    create: (data: { text: string; assigner: string }) =>
      this.request<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (
      id: string,
      data: { text?: string; isCompleted?: boolean; assigner?: string },
    ) =>
      this.request<Task>(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  };

  // Votes
  votes = {
    get: (id: string) => this.request<Vote>(`/votes/${id}`),
    create: (data: {
      title: string;
      maxVotes: number;
      voteOptions: string[];
    }) =>
      this.request<Vote>("/votes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    cast: (id: string, votedOptions: number[]) =>
      this.request<Vote>(`/votes/${id}/cast`, {
        method: "POST",
        body: JSON.stringify({ votedOptions }),
      }),
  };
}

// Export a factory function
export function createApiClient(config: ApiConfig) {
  return new ApiClient(config);
}

import type { ApiClient } from "@apps/api-client";
import { useWebSocket } from "./websocket/index.ts";

/**
 * Unread count for a single channel
 */
export interface ChannelUnreadCount {
  channelId: string;
  unreadCount: number;
}

/**
 * Manages unread message counts across channels
 */
export class UnreadManager {
  private unreadCounts = $state<Map<string, number>>(new Map());
  private api: ApiClient;
  private organizationId: string;

  constructor(api: ApiClient, organizationId: () => string) {
    this.api = api;
    this.organizationId = $derived(organizationId());

    useWebSocket("message:created", () => {
      this.fetchUnreadCounts();
    });
  }

  /**
   * Fetch unread counts for all channels in the organization
   */
  async fetchUnreadCounts() {
    try {
      const response =
        // @ts-expect-error - Eden Treaty dynamic property access for unread route
        await this.api.organizations[this.organizationId].unread.get();
      if (response.data) {
        const counts = response.data as ChannelUnreadCount[];
        this.unreadCounts.clear();
        for (const { channelId, unreadCount } of counts) {
          this.unreadCounts.set(channelId, unreadCount);
        }
      }
    } catch (error) {
      console.error("Failed to fetch unread counts:", error);
    }
  }

  /**
   * Mark a channel as read
   */
  async markAsRead(channelId: string, lastReadMessageId?: string) {
    try {
      // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
      await this.api.channels[channelId].read.post({
        lastReadMessageId,
      });
      this.unreadCounts.set(channelId, 0);
    } catch (error) {
      console.error("Failed to mark channel as read:", error);
    }
  }

  /**
   * Get unread count for a specific channel
   */
  getUnreadCount(channelId: string): number {
    return this.unreadCounts.get(channelId) ?? 0;
  }

  /**
   * Check if a channel has unread messages
   */
  hasUnread(channelId: string): boolean {
    return this.getUnreadCount(channelId) > 0;
  }
}

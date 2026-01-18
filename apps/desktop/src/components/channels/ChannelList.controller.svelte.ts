import type { Channel, ChannelGroup } from "@packages/api-client";
import { onMount } from "svelte";
import { getApiClient, unwrapResponse, useQuery } from "@/lib/api.svelte";
import { confirm } from "@/lib/confirm/confirm.svelte.ts";
import { showToast } from "@/lib/toast/toast.svelte.ts";
import { UnreadManager } from "@/lib/unread.svelte";
import { useWebSocket } from "@/lib/websocket";
import {
  type GroupedChannels,
  organizeChannelsIntoGroups,
  useChannelGroupState,
} from "./channelGroups.svelte.ts";

export class ChannelListController {
  #api = getApiClient();
  #getOrgId: () => string;

  channels;
  channelGroups;
  unreadManager;
  groupState;

  #organized: GroupedChannels = $derived.by(() =>
    organizeChannelsIntoGroups(
      this.channels.data ?? [],
      this.channelGroups.data ?? [],
    ),
  );

  get organized() {
    return this.#organized;
  }

  get rootGroups() {
    return this.#organized.groups.filter((g) => g.parentGroupId === null);
  }

  get ungroupedChannels() {
    return this.#organized.channelsByGroup.get(null) ?? [];
  }

  constructor(organizationId: () => string) {
    this.#getOrgId = organizationId;

    this.channels = useQuery<Channel[]>(async () => {
      const response = await this.#api.channels.get({
        query: { organizationId: this.#getOrgId() },
      });
      return unwrapResponse(response);
    });

    this.channelGroups = useQuery<ChannelGroup[]>(async () => {
      const response = await this.#api["channel-groups"].get({
        query: { organizationId: this.#getOrgId() },
      });
      return unwrapResponse(response);
    });

    this.unreadManager = new UnreadManager(this.#api, organizationId);
    this.groupState = useChannelGroupState(organizationId);

    useWebSocket("message:created", () =>
      this.unreadManager.fetchUnreadCounts(),
    );
    onMount(() => this.unreadManager.fetchUnreadCounts());
  }

  async createGroup(name: string, parentGroupId: string | null) {
    try {
      await this.#api["channel-groups"].post({
        name,
        organizationId: this.#getOrgId(),
        parentGroupId: parentGroupId ?? undefined,
      });
      this.channelGroups.refetch();
      showToast("Group created", "success");
    } catch (error) {
      showToast("Failed to create group", "error");
      throw error;
    }
  }

  async renameGroup(groupId: string, newName: string) {
    try {
      await this.#api["channel-groups"]({ id: groupId }).patch({
        name: newName,
      });
      this.channelGroups.refetch();
      showToast("Group renamed", "success");
    } catch (error) {
      showToast("Failed to rename group", "error");
      throw error;
    }
  }

  async deleteGroup(groupId: string) {
    const confirmed = await confirm({
      title: "Delete Group",
      message:
        "Are you sure you want to delete this group? Channels in this group will be ungrouped.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await this.#api["channel-groups"]({ id: groupId }).delete();
      this.channelGroups.refetch();
      showToast("Group deleted", "success");
    } catch (error) {
      showToast("Failed to delete group", "error");
      throw error;
    }
  }

  async editChannel(channelId: string, name: string, description: string) {
    try {
      await this.#api.channels({ id: channelId }).patch({
        name,
        description: description || null,
      });
      this.channels.refetch();
      showToast("Channel updated", "success");
    } catch (error) {
      showToast("Failed to update channel", "error");
      throw error;
    }
  }

  async moveChannelToGroup(channelId: string, groupId: string | null) {
    try {
      await this.#api.channels({ id: channelId }).group.patch({ groupId });
      this.channels.refetch();
    } catch (error) {
      showToast("Failed to move channel", "error");
      throw error;
    }
  }

  async deleteChannel(channelId: string) {
    const confirmed = await confirm({
      title: "Delete Channel",
      message:
        "Are you sure you want to delete this channel? All messages will be lost.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await this.#api.channels({ id: channelId }).delete();
      this.channels.refetch();
      showToast("Channel deleted", "success");
    } catch (error) {
      showToast("Failed to delete channel", "error");
      throw error;
    }
  }

  refetchChannels() {
    this.channels.refetch();
  }
}

import type { Channel, ChannelGroup } from "@packages/api-client";
import { browser } from "$app/environment";

const STORAGE_KEY = "channel-groups-collapsed";

export type { ChannelGroup };

export interface GroupedChannels {
  groups: ChannelGroup[];
  channelsByGroup: Map<string | null, Channel[]>;
}

/**
 * Hook for managing channel group collapsed state.
 * Persists state to localStorage.
 */
export function useChannelGroupState(organizationId: () => string) {
  let collapsedGroups = $state<Set<string>>(new Set());

  function loadState() {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${organizationId()}`);
      if (stored) collapsedGroups = new Set(JSON.parse(stored));
    } catch {
      // Ignore parse errors
    }
  }

  function saveState() {
    if (!browser) return;
    localStorage.setItem(
      `${STORAGE_KEY}-${organizationId()}`,
      JSON.stringify([...collapsedGroups]),
    );
  }

  $effect(() => {
    loadState();
  });

  function isCollapsed(groupId: string): boolean {
    return collapsedGroups.has(groupId);
  }

  function toggle(groupId: string) {
    if (collapsedGroups.has(groupId)) {
      collapsedGroups.delete(groupId);
    } else {
      collapsedGroups.add(groupId);
    }
    collapsedGroups = new Set(collapsedGroups);
    saveState();
  }

  return {
    isCollapsed,
    toggle,
  };
}

/**
 * Organize channels into groups.
 * Channels without a groupId go into the null group (ungrouped).
 */
export function organizeChannelsIntoGroups(
  channels: Channel[],
  groups: ChannelGroup[],
): GroupedChannels {
  const channelsByGroup = new Map<string | null, Channel[]>();

  // Initialize with empty arrays for all groups
  channelsByGroup.set(null, []);
  for (const group of groups) {
    channelsByGroup.set(group.id, []);
  }

  for (const channel of channels) {
    const groupId = channel.groupId ?? null;
    const list = channelsByGroup.get(groupId);
    if (list) {
      list.push(channel);
    } else {
      const ungrouped = channelsByGroup.get(null);
      if (ungrouped) ungrouped.push(channel);
    }
  }

  return { groups, channelsByGroup };
}

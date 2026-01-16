<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import type { Channel } from "@packages/api-client";
  import type { UnreadManager } from "@/lib/unread.svelte";
  import type { Selection } from "$components/chat/types";
  import Self from "./ChannelGroup.svelte";
  import ChannelItem from "./ChannelItem.svelte";
  import type { ChannelGroup as ChannelGroupType } from "./channelGroups.svelte.ts";

  interface Props {
    group: ChannelGroupType;
    channels: Channel[];
    childGroups: ChannelGroupType[];
    allGroups: ChannelGroupType[];
    allChannelsByGroup: Map<string | null, Channel[]>;
    organizationId: string;
    screenMode: Selection;
    unreadManager: UnreadManager;
    depth?: number;
    isCollapsed: (groupId: string) => boolean;
    onToggle: (groupId: string) => void;
  }

  let {
    group,
    channels,
    childGroups,
    allGroups,
    allChannelsByGroup,
    organizationId,
    screenMode,
    unreadManager,
    depth = 0,
    isCollapsed,
    onToggle,
  }: Props = $props();

  const collapsed = $derived(isCollapsed(group.id));
  const indent = $derived(`${depth * 0.75}rem`);
</script>

<div class="flex flex-col">
  <button
    type="button"
    class="hover:bg-base-300 flex items-center gap-1 rounded px-2 py-1.5 text-left text-xs font-medium tracking-wide transition-colors"
    style:padding-left={indent}
    onclick={() => onToggle(group.id)}
  >
    {#if collapsed}
      <ChevronRight class="text-muted size-3.5 flex-shrink-0" />
    {:else}
      <ChevronDown class="text-muted size-3.5 flex-shrink-0" />
    {/if}
    <span class="text-muted uppercase">{group.name}</span>
  </button>

  {#if !collapsed}
    <nav class="flex flex-col">
      {#each channels as channel (channel.id)}
        <ChannelItem
          {channel}
          {organizationId}
          active={screenMode.type === "chat" &&
            screenMode.selectedChannelId === channel.id}
          unreadCount={unreadManager.getUnreadCount(channel.id)}
          indent={`calc(${indent} + 0.5rem)`}
        />
      {/each}

      {#each childGroups as child (child.id)}
        <Self
          group={child}
          channels={allChannelsByGroup.get(child.id) ?? []}
          childGroups={allGroups.filter((g) => g.parentGroupId === child.id)}
          {allGroups}
          {allChannelsByGroup}
          {organizationId}
          {screenMode}
          {unreadManager}
          depth={depth + 1}
          {isCollapsed}
          {onToggle}
        />
      {/each}
    </nav>
  {/if}
</div>

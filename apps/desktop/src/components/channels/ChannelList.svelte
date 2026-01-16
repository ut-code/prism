<script lang="ts">
  import User from "@lucide/svelte/icons/user";
  import type { Channel } from "@packages/api-client";
  import { onMount } from "svelte";
  import { getApiClient, unwrapResponse, useQuery } from "@/lib/api.svelte";
  import { UnreadManager } from "@/lib/unread.svelte";
  import { useWebSocket } from "@/lib/websocket";
  import type { Selection } from "$components/chat/types";
  import ChannelGroup from "./ChannelGroup.svelte";
  import ChannelItem from "./ChannelItem.svelte";
  import CreateChannelButton from "./CreateChannelButton.svelte";
  import CreateGroupButton from "./CreateGroupButton.svelte";
  import DMSection from "./DMSection.svelte";
  import {
    type ChannelGroup as ChannelGroupType,
    organizeChannelsIntoGroups,
    useChannelGroupState,
  } from "./channelGroups.svelte.ts";

  const api = getApiClient();

  interface Props {
    organizationId: string;
    screenMode: Selection;
  }

  let { organizationId, screenMode = $bindable() }: Props = $props();

  const channels = useQuery<Channel[]>(async () => {
    const response = await api.channels.get({ query: { organizationId } });
    return unwrapResponse(response);
  });

  const channelGroups = useQuery<ChannelGroupType[]>(async () => {
    const response = await api["channel-groups"].get({
      query: { organizationId },
    });
    return unwrapResponse(response);
  });

  const unreadManager = new UnreadManager(api, () => organizationId);
  const groupState = useChannelGroupState(() => organizationId);

  const organized = $derived(
    organizeChannelsIntoGroups(channels.data ?? [], channelGroups.data ?? []),
  );

  const rootGroups = $derived(
    organized.groups.filter((g) => g.parentGroupId === null),
  );

  const ungroupedChannels = $derived(organized.channelsByGroup.get(null) ?? []);

  // WebSocket: refresh unread counts on new messages
  useWebSocket("message:created", () => {
    unreadManager.fetchUnreadCounts();
  });

  onMount(() => {
    unreadManager.fetchUnreadCounts();
  });

  async function handleCreateGroup(name: string, parentGroupId: string | null) {
    await api["channel-groups"].post({
      name,
      organizationId,
      parentGroupId: parentGroupId ?? undefined,
    });
    channelGroups.refetch();
  }
</script>

<div class="flex h-full flex-col">
  <!-- Channels section -->
  <section class="flex-1 overflow-y-auto">
    <header class="flex items-center justify-between px-4 py-2">
      <span class="text-muted text-xs font-medium tracking-wider uppercase">
        Channels
      </span>
      <div class="flex items-center gap-1">
        <CreateGroupButton
          groups={channelGroups.data ?? []}
          onCreate={handleCreateGroup}
        />
        <CreateChannelButton
          {organizationId}
          groups={channelGroups.data ?? []}
          onCreated={() => channels.refetch()}
        />
      </div>
    </header>

    <nav class="px-2">
      {#if channels.data}
        <!-- Grouped channels -->
        {#each rootGroups as group (group.id)}
          <ChannelGroup
            {group}
            channels={organized.channelsByGroup.get(group.id) ?? []}
            childGroups={organized.groups.filter(
              (g) => g.parentGroupId === group.id,
            )}
            allGroups={organized.groups}
            allChannelsByGroup={organized.channelsByGroup}
            {organizationId}
            {screenMode}
            {unreadManager}
            isCollapsed={groupState.isCollapsed}
            onToggle={groupState.toggle}
          />
        {/each}

        <!-- Ungrouped channels -->
        {#each ungroupedChannels as channel (channel.id)}
          <ChannelItem
            {channel}
            {organizationId}
            active={screenMode.type === "chat" &&
              screenMode.selectedChannelId === channel.id}
            unreadCount={unreadManager.getUnreadCount(channel.id)}
          />
        {/each}
      {:else}
        <div class="text-muted px-2 py-4 text-center text-sm opacity-60">
          Loading...
        </div>
      {/if}

      {#if channels.data?.length === 0}
        <div class="text-muted px-2 py-4 text-center text-sm opacity-60">
          No channels
        </div>
      {/if}
    </nav>
  </section>

  <!-- DM section -->
  <DMSection
    {organizationId}
    selectedChannelId={screenMode.type === "chat"
      ? screenMode.selectedChannelId
      : undefined}
  />

  <!-- Settings link -->
  <footer class="border-subtle border-t p-2">
    <a
      href={`/orgs/${organizationId}/personalization`}
      class="text-muted hover:bg-base-300 hover:text-base-content flex items-center gap-2 rounded px-2 py-2 text-sm transition-colors"
    >
      <User class="size-4" />
      <span>Settings</span>
    </a>
  </footer>
</div>

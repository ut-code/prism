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
  import {
    type ChannelGroup as ChannelGroupType,
    organizeChannelsIntoGroups,
    useChannelGroupState,
  } from "./channelGroups.svelte.ts";
  import DMSection from "./DMSection.svelte";
  import EditChannelModal from "./EditChannelModal.svelte";
  import RenameGroupModal from "./RenameGroupModal.svelte";

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

  useWebSocket("message:created", () => unreadManager.fetchUnreadCounts());
  onMount(() => unreadManager.fetchUnreadCounts());

  // Group CRUD handlers
  async function handleCreateGroup(name: string, parentGroupId: string | null) {
    await api["channel-groups"].post({
      name,
      organizationId,
      parentGroupId: parentGroupId ?? undefined,
    });
    channelGroups.refetch();
  }

  async function handleRenameGroup(groupId: string, newName: string) {
    await api["channel-groups"]({ id: groupId }).patch({ name: newName });
    channelGroups.refetch();
  }

  async function handleDeleteGroup(groupId: string) {
    if (!confirm("Are you sure you want to delete this group?")) return;
    await api["channel-groups"]({ id: groupId }).delete();
    channelGroups.refetch();
  }

  // Channel handlers
  async function handleEditChannel(
    channelId: string,
    name: string,
    description: string,
  ) {
    await api.channels({ id: channelId }).patch({
      name,
      description: description || null,
    });
    channels.refetch();
  }

  async function handleMoveChannelToGroup(
    channelId: string,
    groupId: string | null,
  ) {
    await api.channels({ id: channelId }).group.patch({ groupId });
    channels.refetch();
  }

  async function handleDeleteChannel(channelId: string) {
    if (!confirm("Are you sure you want to delete this channel?")) return;
    await api.channels({ id: channelId }).delete();
    channels.refetch();
  }

  // Context menu state
  let selectedGroupId = $state<string | null>(null);
  let openChannelModal: (() => void) | null = $state(null);
  let openGroupModal: (() => void) | null = $state(null);
  let openRenameModal: ((id: string, name: string) => void) | null =
    $state(null);
  let openEditChannelModal: ((channel: Channel) => void) | null = $state(null);

  function handleCreateChannelFromContext(groupId: string) {
    selectedGroupId = groupId;
    setTimeout(() => openChannelModal?.(), 0);
  }

  function handleCreateGroupFromContext(parentGroupId: string) {
    selectedGroupId = parentGroupId;
    setTimeout(() => openGroupModal?.(), 0);
  }

  function handleRenameFromContext(groupId: string, currentName: string) {
    openRenameModal?.(groupId, currentName);
  }

  function handleEditChannelFromContext(channel: Channel) {
    openEditChannelModal?.(channel);
  }
</script>

<div class="flex h-full flex-col">
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
            onCreateChannel={handleCreateChannelFromContext}
            onCreateGroup={handleCreateGroupFromContext}
            onRename={handleRenameFromContext}
            onDelete={handleDeleteGroup}
            onEditChannel={handleEditChannelFromContext}
            onDeleteChannel={handleDeleteChannel}
            onMoveChannelToGroup={handleMoveChannelToGroup}
          />
        {/each}

        {#if rootGroups.length > 0 && ungroupedChannels.length > 0}
          <div class="divider text-muted my-2 text-xs">Ungrouped</div>
        {/if}

        {#each ungroupedChannels as channel (channel.id)}
          <ChannelItem
            {channel}
            {organizationId}
            active={screenMode.type === "chat" &&
              screenMode.selectedChannelId === channel.id}
            unreadCount={unreadManager.getUnreadCount(channel.id)}
            groups={organized.groups}
            onEdit={handleEditChannelFromContext}
            onDelete={handleDeleteChannel}
            onMoveToGroup={handleMoveChannelToGroup}
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

  <!-- Hidden modals for context menu -->
  <CreateChannelButton
    {organizationId}
    groups={channelGroups.data ?? []}
    defaultGroupId={selectedGroupId}
    onCreated={() => channels.refetch()}
    showButton={false}
    registerOpen={(fn) => (openChannelModal = fn)}
  />
  <CreateGroupButton
    groups={channelGroups.data ?? []}
    defaultParentGroupId={selectedGroupId}
    onCreate={handleCreateGroup}
    showButton={false}
    registerOpen={(fn) => (openGroupModal = fn)}
  />
  <RenameGroupModal
    onRename={handleRenameGroup}
    registerOpen={(fn) => (openRenameModal = fn)}
  />
  <EditChannelModal
    onSave={handleEditChannel}
    registerOpen={(fn) => (openEditChannelModal = fn)}
  />

  <DMSection
    {organizationId}
    selectedChannelId={screenMode.type === "chat"
      ? screenMode.selectedChannelId
      : undefined}
  />

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

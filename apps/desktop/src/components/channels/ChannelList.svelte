<script lang="ts">
  import FolderPlus from "@lucide/svelte/icons/folder-plus";
  import Plus from "@lucide/svelte/icons/plus";
  import User from "@lucide/svelte/icons/user";
  import type { Selection } from "$components/chat/types";
  import ChannelGroup from "./ChannelGroup.svelte";
  import ChannelItem from "./ChannelItem.svelte";
  import { ChannelListController } from "./ChannelList.controller.svelte.ts";
  import CreateChannelModal from "./CreateChannelModal.svelte";
  import CreateGroupModal from "./CreateGroupModal.svelte";
  import DMSection from "./DMSection.svelte";
  import EditChannelModal from "./EditChannelModal.svelte";
  import { useChannelModals } from "./modals.svelte.ts";
  import RenameGroupModal from "./RenameGroupModal.svelte";

  interface Props {
    organizationId: string;
    screenMode: Selection;
  }

  let { organizationId, screenMode = $bindable() }: Props = $props();

  const controller = new ChannelListController(() => organizationId);
  const modals = useChannelModals();
</script>

<div class="flex h-full flex-col">
  <section class="flex-1 overflow-y-auto">
    <header class="flex items-center justify-between px-4 py-2">
      <span class="text-muted text-xs font-medium tracking-wider uppercase">
        Channels
      </span>
      <div class="flex items-center gap-1">
        <button
          class="btn btn-ghost btn-xs btn-square"
          title="New group"
          onclick={() => modals.openCreateGroup()}
        >
          <FolderPlus class="text-muted size-4" />
        </button>
        <button
          class="btn btn-ghost btn-xs btn-square"
          title="New channel"
          onclick={() => modals.openCreateChannel()}
        >
          <Plus class="text-muted size-4" />
        </button>
      </div>
    </header>

    <nav class="px-2">
      {#if controller.channels.data}
        {#each controller.rootGroups as group (group.id)}
          <ChannelGroup
            {group}
            channels={controller.organized.channelsByGroup.get(group.id) ?? []}
            childGroups={controller.organized.groups.filter(
              (g) => g.parentGroupId === group.id,
            )}
            allGroups={controller.organized.groups}
            allChannelsByGroup={controller.organized.channelsByGroup}
            {organizationId}
            {screenMode}
            unreadManager={controller.unreadManager}
            isCollapsed={controller.groupState.isCollapsed}
            onToggle={controller.groupState.toggle}
            onCreateChannel={(id) => modals.openCreateChannel(id)}
            onCreateGroup={(id) => modals.openCreateGroup(id)}
            onRename={(id, name) => modals.openRenameGroup(id, name)}
            onDelete={(id) => controller.deleteGroup(id)}
            onEditChannel={(ch) => modals.openEditChannel(ch)}
            onDeleteChannel={(id) => controller.deleteChannel(id)}
            onMoveChannelToGroup={(chId, gId) =>
              controller.moveChannelToGroup(chId, gId)}
          />
        {/each}

        {#if controller.rootGroups.length > 0 && controller.ungroupedChannels.length > 0}
          <div class="divider text-muted my-2 text-xs">Ungrouped</div>
        {/if}

        {#each controller.ungroupedChannels as channel (channel.id)}
          <ChannelItem
            {channel}
            {organizationId}
            active={screenMode.type === "chat" &&
              screenMode.selectedChannelId === channel.id}
            unreadCount={controller.unreadManager.getUnreadCount(channel.id)}
            groups={controller.organized.groups}
            onEdit={(ch) => modals.openEditChannel(ch)}
            onDelete={(id) => controller.deleteChannel(id)}
            onMoveToGroup={(chId, gId) =>
              controller.moveChannelToGroup(chId, gId)}
          />
        {/each}

        {#if controller.channels.data.length === 0}
          <div class="text-muted px-2 py-4 text-center text-sm opacity-60">
            No channels
          </div>
        {/if}
      {:else}
        <div class="text-muted px-2 py-4 text-center text-sm opacity-60">
          Loading...
        </div>
      {/if}
    </nav>
  </section>

  <CreateChannelModal
    {organizationId}
    groups={controller.channelGroups.data ?? []}
    isOpen={modals.createChannel.isOpen}
    defaultGroupId={modals.createChannel.defaultGroupId}
    onClose={() => modals.closeCreateChannel()}
    onCreated={() => controller.refetchChannels()}
  />

  <CreateGroupModal
    groups={controller.channelGroups.data ?? []}
    isOpen={modals.createGroup.isOpen}
    defaultParentGroupId={modals.createGroup.defaultParentGroupId}
    onClose={() => modals.closeCreateGroup()}
    onCreate={(name, parentId) => controller.createGroup(name, parentId)}
  />

  <RenameGroupModal
    isOpen={modals.renameGroup.isOpen}
    groupId={modals.renameGroup.groupId}
    currentName={modals.renameGroup.currentName}
    onClose={() => modals.closeRenameGroup()}
    onRename={(id, name) => controller.renameGroup(id, name)}
  />

  <EditChannelModal
    isOpen={modals.editChannel.isOpen}
    channel={modals.editChannel.channel}
    onClose={() => modals.closeEditChannel()}
    onSave={(id, name, desc) => controller.editChannel(id, name, desc)}
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

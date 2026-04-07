<script lang="ts">
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import FolderInput from "@lucide/svelte/icons/folder-input";
  import FolderOutput from "@lucide/svelte/icons/folder-output";
  import LogOut from "@lucide/svelte/icons/log-out";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import type { Channel, ChannelGroup } from "@packages/api-client";

  interface Props {
    x: number;
    y: number;
    channelType: Channel["type"];
    currentGroupId: string | null;
    groups: ChannelGroup[];
    onEdit: () => void;
    onDelete: () => void;
    onLeave?: () => void;
    onMoveToGroup: (groupId: string | null) => void;
    onClose: () => void;
  }

  const {
    x,
    y,
    channelType,
    currentGroupId,
    groups,
    onEdit,
    onDelete,
    onLeave,
    onMoveToGroup,
    onClose,
  }: Props = $props();

  const canLeave = $derived(channelType !== "default");

  let showMoveSubmenu = $state(false);

  function handleEdit() {
    onEdit();
    onClose();
  }

  function handleDelete() {
    onDelete();
    onClose();
  }

  function handleLeave() {
    onLeave?.();
    onClose();
  }

  function handleSelect(groupId: string | null) {
    onMoveToGroup(groupId);
    onClose();
  }

  const availableGroups = $derived(
    groups.filter((g) => g.id !== currentGroupId),
  );
</script>

<svelte:window
  onclick={onClose}
  onkeydown={(e) => e.key === "Escape" && onClose()}
/>

<div
  class="menu bg-base-200 rounded-box fixed z-50 w-48 p-2 shadow-lg"
  style:left="{x}px"
  style:top="{y}px"
  role="menu"
  tabindex="-1"
  onclick={(e) => e.stopPropagation()}
  onkeydown={(e) => e.key === "Escape" && onClose()}
>
  <button
    type="button"
    class="btn btn-ghost btn-sm justify-start gap-2"
    onclick={handleEdit}
  >
    <Pencil class="size-4" />
    Edit Channel
  </button>

  <div class="divider my-1"></div>

  <!-- Move to submenu trigger -->
  <div class="relative">
    <button
      type="button"
      class="btn btn-ghost btn-sm w-full justify-between gap-2"
      onmouseenter={() => (showMoveSubmenu = true)}
      onmouseleave={() => (showMoveSubmenu = false)}
      onfocus={() => (showMoveSubmenu = true)}
    >
      <span class="flex items-center gap-2">
        <FolderInput class="size-4" />
        Move to
      </span>
      <ChevronRight class="size-4" />
    </button>

    {#if showMoveSubmenu}
      <div
        class="menu bg-base-200 rounded-box absolute top-0 left-full z-50 ml-1 w-44 p-2 shadow-lg"
        role="menu"
        tabindex="-1"
        onmouseenter={() => (showMoveSubmenu = true)}
        onmouseleave={() => (showMoveSubmenu = false)}
      >
        {#each availableGroups as group (group.id)}
          <button
            type="button"
            class="btn btn-ghost btn-sm justify-start gap-2"
            onclick={() => handleSelect(group.id)}
          >
            {group.name}
          </button>
        {/each}

        {#if availableGroups.length === 0}
          <span class="text-muted px-2 py-1 text-xs italic">
            No groups available
          </span>
        {/if}
      </div>
    {/if}
  </div>

  {#if currentGroupId}
    <button
      type="button"
      class="btn btn-ghost btn-sm justify-start gap-2"
      onclick={() => handleSelect(null)}
    >
      <FolderOutput class="size-4" />
      Remove from Group
    </button>
  {/if}

  {#if canLeave}
    <button
      type="button"
      class="btn btn-ghost btn-sm justify-start gap-2"
      onclick={handleLeave}
    >
      <LogOut class="size-4" />
      Leave Channel
    </button>
  {/if}

  <div class="divider my-1"></div>

  <button
    type="button"
    class="btn btn-ghost btn-sm text-error justify-start gap-2"
    onclick={handleDelete}
  >
    <Trash2 class="size-4" />
    Delete Channel
  </button>
</div>

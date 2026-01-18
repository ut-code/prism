<script lang="ts">
  import FolderPlus from "@lucide/svelte/icons/folder-plus";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Plus from "@lucide/svelte/icons/plus";
  import Trash2 from "@lucide/svelte/icons/trash-2";

  interface Props {
    x: number;
    y: number;
    onCreateChannel: () => void;
    onCreateGroup: () => void;
    onRename: () => void;
    onDelete: () => void;
    onClose: () => void;
  }

  const {
    x,
    y,
    onCreateChannel,
    onCreateGroup,
    onRename,
    onDelete,
    onClose,
  }: Props = $props();

  function handleClick(action: () => void) {
    action();
    onClose();
  }
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
    onclick={() => handleClick(onCreateChannel)}
  >
    <Plus class="size-4" />
    New Channel
  </button>
  <button
    type="button"
    class="btn btn-ghost btn-sm justify-start gap-2"
    onclick={() => handleClick(onCreateGroup)}
  >
    <FolderPlus class="size-4" />
    New Group
  </button>
  <div class="divider my-1"></div>
  <button
    type="button"
    class="btn btn-ghost btn-sm justify-start gap-2"
    onclick={() => handleClick(onRename)}
  >
    <Pencil class="size-4" />
    Rename
  </button>
  <button
    type="button"
    class="btn btn-ghost btn-sm text-error hover:bg-error/20 justify-start gap-2"
    onclick={() => handleClick(onDelete)}
  >
    <Trash2 class="size-4" />
    Delete
  </button>
</div>

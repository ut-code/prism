<script lang="ts">
  interface Props {
    onReply: () => void;
    onAddReaction: (e: MouseEvent) => void;
    onShowReactions: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onPin: () => void;
    isPinned: boolean;
    isOwnMessage?: boolean;
  }

  let {
    onReply,
    onAddReaction,
    onShowReactions,
    onEdit,
    onDelete,
    onPin,
    isPinned,
    isOwnMessage = false,
  }: Props = $props();

  function handleDelete() {
    if (window.confirm("Are you sure you want to delete this message?")) {
      onDelete?.();
    }
  }
</script>

<ul
  class="menu dropdown-content bg-base-100 absolute z-[1] w-40 rounded-md border p-2 shadow"
>
  <li>
    <button onclick={onReply}>Reply</button>
  </li>
  <li>
    <button onclick={onAddReaction}>Add Reaction</button>
  </li>
  <li>
    <button onclick={onShowReactions}>Show Reactions</button>
  </li>
  <li>
    <button onclick={onPin}>
      {isPinned ? "Unpin" : "Pin"}
    </button>
  </li>
  {#if isOwnMessage}
    {#if onEdit}
      <li>
        <button onclick={onEdit}>Edit</button>
      </li>
    {/if}
    {#if onDelete}
      <li>
        <button class="text-error" onclick={handleDelete}>Delete</button>
      </li>
    {/if}
  {/if}
</ul>

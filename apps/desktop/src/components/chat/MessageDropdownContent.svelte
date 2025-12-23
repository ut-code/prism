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
</script>

<ul
  class="menu dropdown-content bg-base-100 absolute z-[1] w-40 rounded-md border p-2 shadow"
>
  <li>
    <button onclick={onReply}>返信</button>
  </li>
  <li>
    <button onclick={onAddReaction}>リアクションを付ける</button>
  </li>
  <li>
    <button onclick={onShowReactions}>リアクションを表示</button>
  </li>
  <li>
    <button onclick={onPin}>
      {isPinned ? "ピン解除" : "ピン留め"}
    </button>
  </li>
  {#if isOwnMessage}
    {#if onEdit}
      <li>
        <button onclick={onEdit}>編集</button>
      </li>
    {/if}
    {#if onDelete}
      <li>
        <button class="text-error" onclick={onDelete}>削除</button>
      </li>
    {/if}
  {/if}
</ul>

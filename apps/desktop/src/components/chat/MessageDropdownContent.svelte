<script lang="ts">
  interface Props {
    onReply: () => void;
    onAddReaction: (e: MouseEvent) => void;
    onShowReactions: () => void;
  }

  let { onReply, onAddReaction, onShowReactions }: Props = $props();
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
</ul>

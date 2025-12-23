<script lang="ts">
  import type { Message } from "@apps/api-client";
  import X from "@lucide/svelte/icons/x";

  interface Props {
    replyingTo: Message;
    onclose: () => void;
  }

  let { replyingTo, onclose }: Props = $props();
</script>

<!--
  Displays a banner indicating the message being replied to.
  Shows the author and a preview of the message content.
-->
<div
  class="bg-base-200 mb-2 flex items-center justify-between rounded-md p-2 text-sm"
>
  <div class="text-base-content/70 truncate">
    <span class="font-semibold">返信先:</span>
    <span class="text-primary font-semibold">{replyingTo.author}</span>
    <span class="truncate">: {replyingTo.content}</span>
  </div>
  <button class="btn btn-ghost btn-circle btn-sm" onclick={onclose}>
    <X class="size-4" />
  </button>
</div>

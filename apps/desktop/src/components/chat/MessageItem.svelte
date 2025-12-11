<script lang="ts">
  import type { Message } from "@apps/api-client";
  import MdiDotsVertical from "@/icons/mdi-dots-vertical.svelte";
  import FileAttachment from "../../features/files/view/FileAttachment.svelte";
  import ReactionButtons from "./ReactionButtons.svelte";
  import VoteViewer from "./VoteViewer.svelte";

  interface Props {
    message: Message;
    parentMessage?: Message;
    onContextMenu: (e: MouseEvent) => void;
    onDotsClick: (e: MouseEvent) => void;
  }

  let { message, parentMessage, onContextMenu, onDotsClick }: Props = $props();

  function formatTime(timestamp: Date | number | string) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<div
  role="button"
  tabindex="0"
  class="p-1 hover:bg-sky-900"
  oncontextmenu={onContextMenu}
>
  {#if parentMessage}
    <div class="flex items-center gap-2">
      <span class="text-base-content/60 text-xs">返信</span>
      <span class="text-primary font-semibold">{parentMessage.author}</span>
      <span class="text-base-content/60 text-xs">
        {parentMessage.content}
      </span>
    </div>
  {/if}
  <div class="group relative flex flex-col">
    <div class="flex items-baseline gap-2">
      <span class="text-primary font-semibold">{message.author}</span>
      <span class="text-base-content/60 text-xs">
        {formatTime(message.createdAt)}
      </span>
    </div>
    <div class="text-base-content ml-0 whitespace-pre-wrap">
      {message.content}
    </div>

    {#if message.attachments && message.attachments.length > 0}
      <div class="mt-2 space-y-2">
        {#each message.attachments as fileId}
          <FileAttachment {fileId} compact={false} />
        {/each}
      </div>
    {/if}
    {#if message.vote}
      <VoteViewer voteId={message.vote} />
    {/if}
    <div
      class="bg-base-100 absolute top-4 right-4 -translate-y-1/2 rounded-md border opacity-0 group-hover:opacity-100"
    >
      <button class="btn btn-ghost btn-sm p-2" onclick={onDotsClick}>
        <MdiDotsVertical />
      </button>
    </div>
    <ReactionButtons messageId={message.id} />
  </div>
</div>

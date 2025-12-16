<script lang="ts">
  import type { Message } from "@apps/api-client";
  import MdiDotsVertical from "@/icons/mdi-dots-vertical.svelte";
  import MdiPin from "@/icons/mdi-pin.svelte";
  import FileAttachment from "../../features/files/view/FileAttachment.svelte";
  import ReactionButtons from "./ReactionButtons.svelte";
  import VoteViewer from "./VoteViewer.svelte";

  interface Props {
    message: Message;
    parentMessage?: Message;
    onContextMenu: (e: MouseEvent) => void;
    onDotsClick: (e: MouseEvent) => void;
    isEditing?: boolean;
    editedContent?: string;
    onEditChange?: (content: string) => void;
    onEditSave?: () => void;
    onEditCancel?: () => void;
  }

  let {
    message,
    parentMessage,
    onContextMenu,
    onDotsClick,
    isEditing = false,
    editedContent = "",
    onEditChange,
    onEditSave,
    onEditCancel,
  }: Props = $props();

  function formatTime(timestamp: Date | number | string) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const isEdited = $derived(
    message.editedAt && message.editedAt !== message.createdAt,
  );
</script>

<div
  id="message-{message.id}"
  role="button"
  tabindex="0"
  class="p-1 transition-all hover:bg-sky-900"
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
      {#if isEdited}
        <span class="text-base-content/60 text-xs italic">(編集済み)</span>
      {/if}
      {#if message.pinnedAt}
        <div class="text-warning flex items-center gap-1 text-xs">
          <MdiPin class="h-3 w-3" />
          <span>ピン留め済み</span>
        </div>
      {/if}
    </div>

    {#if isEditing}
      <div class="mt-2 flex flex-col gap-2">
        <textarea
          class="textarea textarea-bordered w-full"
          value={editedContent}
          oninput={(e) =>
            onEditChange?.(
              e.currentTarget instanceof HTMLTextAreaElement
                ? e.currentTarget.value
                : "",
            )}
          rows="3"
        ></textarea>
        <div class="flex gap-2">
          <button class="btn btn-primary btn-sm" onclick={onEditSave}>
            保存
          </button>
          <button class="btn btn-ghost btn-sm" onclick={onEditCancel}>
            キャンセル
          </button>
        </div>
      </div>
    {:else}
      <div class="text-base-content ml-0 whitespace-pre-wrap">
        {message.content}
      </div>
    {/if}

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

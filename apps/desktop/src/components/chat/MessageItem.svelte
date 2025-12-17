<script lang="ts">
  import type { Message } from "@apps/api-client";
  import MdiDotsVertical from "~icons/mdi/dots-vertical";
  import MdiPin from "~icons/mdi/pin";
  import MdiReply from "~icons/mdi/reply";
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

  const isEdited = $derived(
    message.editedAt && message.editedAt !== message.createdAt,
  );

  function formatTime(timestamp: Date | number | string) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<article
  id="message-{message.id}"
  class="group hover:bg-base-200/30 relative px-6 py-3 transition-all duration-200"
  oncontextmenu={onContextMenu}
>
  <!-- Reply reference -->
  {#if parentMessage}
    <div
      class="mb-2 flex items-center gap-1.5 text-xs opacity-60 transition-opacity duration-150 group-hover:opacity-80"
    >
      <MdiReply class="h-3 w-3" />
      <span class="text-primary/80 font-medium">{parentMessage.author}</span>
      <span class="truncate">{parentMessage.content}</span>
    </div>
  {/if}

  <!-- Message header -->
  <div class="flex items-baseline gap-2.5">
    <span class="text-primary text-sm font-semibold">{message.author}</span>
    <span
      class="text-xs opacity-40 transition-opacity duration-150 group-hover:opacity-60"
      >{formatTime(message.createdAt)}</span
    >
    {#if isEdited}
      <span
        class="text-xs opacity-30 transition-opacity duration-150 group-hover:opacity-50"
        >(編集済み)</span
      >
    {/if}
    {#if message.pinnedAt}
      <span class="text-warning flex items-center gap-1 text-xs opacity-70">
        <MdiPin class="h-3 w-3" />
        ピン留め
      </span>
    {/if}
  </div>

  <!-- Message content -->
  {#if isEditing}
    <div class="mt-3 space-y-2">
      <textarea
        class="textarea textarea-bordered bg-base-300 w-full text-sm transition-all duration-150"
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
        <button class="btn btn-primary btn-xs" onclick={onEditSave}>保存</button
        >
        <button class="btn btn-ghost btn-xs" onclick={onEditCancel}>
          キャンセル
        </button>
      </div>
    </div>
  {:else}
    <div class="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap opacity-90">
      {message.content}
    </div>
  {/if}

  <!-- Attachments -->
  {#if message.attachments && message.attachments.length > 0}
    <div class="mt-3 space-y-2">
      {#each message.attachments as fileId}
        <FileAttachment {fileId} compact={false} />
      {/each}
    </div>
  {/if}

  <!-- Vote -->
  {#if message.vote}
    <div class="mt-3">
      <VoteViewer voteId={message.vote} />
    </div>
  {/if}

  <!-- Reactions -->
  <ReactionButtons messageId={message.id} />

  <!-- Actions (hover) -->
  <div
    class="border-subtle bg-base-100 absolute top-2 right-4 flex gap-0.5 rounded border opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100"
  >
    <button
      class="btn btn-ghost btn-xs btn-square transition-colors duration-150"
      onclick={onDotsClick}
      title="メニュー"
    >
      <MdiDotsVertical class="h-4 w-4 opacity-60" />
    </button>
  </div>
</article>

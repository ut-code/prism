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
  class="group hover:bg-base-200/50 relative px-4 py-1.5 transition-colors"
  oncontextmenu={onContextMenu}
>
  <!-- Reply reference -->
  {#if parentMessage}
    <div class="text-muted mb-1 flex items-center gap-1.5 text-xs">
      <MdiReply class="h-3 w-3" />
      <span class="text-primary/80 font-medium">{parentMessage.author}</span>
      <span class="truncate opacity-70">{parentMessage.content}</span>
    </div>
  {/if}

  <!-- Message header -->
  <div class="flex items-baseline gap-2">
    <span class="text-primary font-medium">{message.author}</span>
    <span class="timestamp">{formatTime(message.createdAt)}</span>
    {#if isEdited}
      <span class="text-muted text-xs">(編集済み)</span>
    {/if}
    {#if message.pinnedAt}
      <span class="text-warning flex items-center gap-1 text-xs">
        <MdiPin class="h-3 w-3" />
        ピン留め
      </span>
    {/if}
  </div>

  <!-- Message content -->
  {#if isEditing}
    <div class="mt-2 space-y-2">
      <textarea
        class="textarea textarea-bordered bg-base-300 w-full text-sm"
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
    <div
      class="text-base-content/90 text-sm leading-relaxed whitespace-pre-wrap"
    >
      {message.content}
    </div>
  {/if}

  <!-- Attachments -->
  {#if message.attachments && message.attachments.length > 0}
    <div class="mt-2 space-y-1">
      {#each message.attachments as fileId}
        <FileAttachment {fileId} compact={false} />
      {/each}
    </div>
  {/if}

  <!-- Vote -->
  {#if message.vote}
    <div class="mt-2">
      <VoteViewer voteId={message.vote} />
    </div>
  {/if}

  <!-- Reactions -->
  <ReactionButtons messageId={message.id} />

  <!-- Actions (hover) -->
  <div
    class="border-subtle bg-base-100 absolute top-1 right-2 flex gap-0.5 rounded border opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
  >
    <button
      class="btn btn-ghost btn-xs btn-square"
      onclick={onDotsClick}
      title="メニュー"
    >
      <MdiDotsVertical class="h-4 w-4" />
    </button>
  </div>
</article>

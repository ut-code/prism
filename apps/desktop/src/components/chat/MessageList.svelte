<script lang="ts">
  import type { Message } from "@packages/api-client";
  import { onMount } from "svelte";
  import Modal, { ModalManager } from "$lib/modal/modal.svelte";
  import EmojiPalette from "./EmojiPalette.svelte";
  import MessageDropdown from "./MessageDropdown.svelte";
  import MessageDropdownContent from "./MessageDropdownContent.svelte";
  import MessageItem from "./MessageItem.svelte";
  import { MessageListController } from "./messageList.controller.svelte.ts";
  import ReactionList from "./ReactionList.svelte";

  interface Props {
    organizationId: string;
    channelId: string;
    replyingTo: Message | null;
  }

  let { organizationId, channelId, replyingTo = $bindable() }: Props = $props();

  const controller = new MessageListController(() => ({
    organizationId,
    channelId,
  }));
  const modalManager = new ModalManager();

  let messagesContainer: HTMLDivElement;

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  $effect(() => {
    if (controller.messagesData.length > 0) {
      setTimeout(scrollToBottom, 0);
    }
  });

  onMount(() => {
    scrollToBottom();
  });
</script>

<Modal manager={modalManager} />

<div bind:this={messagesContainer} class="flex-1 overflow-y-auto scroll-smooth">
  {#if controller.messagesData.length > 0}
    {#each controller.messagesData as message (message.id)}
      {#snippet reactionListSnippet()}
        <ReactionList {organizationId} messageId={message.id} />
      {/snippet}

      <MessageDropdown
        x={controller.clientX}
        y={controller.clientY}
        visible={controller.visibleDropdown === message.id}
      >
        <MessageDropdownContent
          onReply={() => (replyingTo = message)}
          onAddReaction={(e) => {
            e.stopPropagation();
            controller.showReactionPalette(message.id);
          }}
          onShowReactions={() => modalManager.dispatch(reactionListSnippet)}
          onPin={() => controller.handlePin(message.id)}
          isPinned={!!message.pinnedAt}
          isOwnMessage={controller.isOwnMessage(message)}
          onEdit={() => controller.startEditing(message)}
          onDelete={() => controller.handleDelete(message.id)}
        />
      </MessageDropdown>

      {#if controller.reactionPaletteVisibleFor === message.id}
        <EmojiPalette
          x={controller.clientX}
          y={controller.clientY}
          onClose={() => controller.closeReactionPalette()}
          onEmojiSelected={(emoji) => controller.handleEmojiSelected(emoji)}
        />
      {/if}

      <MessageItem
        {message}
        parentMessage={controller.messagesById.get(message.parentId ?? "")}
        onContextMenu={(e) => {
          e.preventDefault();
          controller.calculateMenuPosition(e);
          controller.showDropdown(message.id);
        }}
        onDotsClick={(e) => {
          e.stopPropagation();
          controller.calculateMenuPosition(e);
          controller.showDropdown(message.id);
        }}
        isEditing={controller.editingMessageId === message.id}
        editedContent={controller.editedContent}
        onEditChange={(content) => (controller.editedContent = content)}
        onEditSave={() => controller.saveEdit(message.id)}
        onEditCancel={() => controller.cancelEditing()}
      />
    {:else}
      <div class="flex h-full items-center justify-center py-16">
        <p class="text-sm opacity-60">No messages yet</p>
      </div>
    {/each}
  {:else}
    <div class="flex h-full items-center justify-center py-16">
      <p class="text-sm opacity-60">Loading messages...</p>
    </div>
  {/if}
</div>

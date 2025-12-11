<script lang="ts">
  import type { Message } from "@apps/api-client";
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
    if (controller.messages.data) {
      setTimeout(scrollToBottom, 0);
    }
  });

  onMount(() => {
    scrollToBottom();
  });
</script>

<Modal manager={modalManager} />

<div bind:this={messagesContainer} class="flex-1 space-y-2 overflow-y-auto p-4">
  {#if controller.messages.data}
    {#each controller.messages.data as message (message.id)}
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
      />
    {:else}
      <div class="text-center text-base-content/60 py-8">
        まだメッセージがありません
      </div>
    {/each}
  {:else}
    <div class="text-base-content/60 py-8 text-center">
      メッセージを読み込み中...
    </div>
  {/if}
</div>

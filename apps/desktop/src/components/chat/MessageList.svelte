<script lang="ts">
  import type { Message } from "@apps/api-client";
  import { onMount } from "svelte";
  import MdiDotsVertical from "@/icons/mdi-dots-vertical.svelte";
  import { getApiClient, getMessage, useMutation, useQuery } from "@/lib/api.svelte";
  import Modal, { ModalManager } from "$lib/modal/modal.svelte";
  import FileAttachment from "../../features/files/view/FileAttachment.svelte";
  import EmojiPalette from "./EmojiPalette.svelte";
  import MessageDropdown from "./MessageDropdown.svelte";
  import ReactionButtons from "./ReactionButtons.svelte";
  import ReactionList from "./ReactionList.svelte";
  import VoteViewer from "./VoteViewer.svelte";

  interface Props {
    organizationId: string;
    channelId: string;
    replyingTo: Message | null;
  }

  let { organizationId, channelId, replyingTo = $bindable() }: Props = $props();

  const api = getApiClient();
  const messages = useQuery<Message[]>(async () => {
    const response = await api.messages.get({ query: { channelId } });
    if (response.error) {
      const errorMsg = typeof response.error.value === "string"
        ? response.error.value
        : JSON.stringify(response.error.value);
      throw new Error(errorMsg);
    }
    if (!response.data) {
      throw new Error("No message data returned");
    }
    return response.data;
  });
  const addReaction = useMutation(
    async (args: { messageId: string; emoji: string }) => {
      const response = await getMessage(api, args.messageId).reactions.post({
        emoji: args.emoji,
      });
      if (response.error) {
        const errorMsg = typeof response.error.value === "string"
          ? response.error.value
          : JSON.stringify(response.error.value);
        throw new Error(errorMsg);
      }
      return response.data;
    },
  );

  const messagesById = $derived(
    new Map(messages.data?.map((message: Message) => [message.id, message])),
  );

  let messagesContainer: HTMLDivElement;

  function formatTime(timestamp: Date | number | string) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  $effect(() => {
    if (messages.data) {
      setTimeout(scrollToBottom, 0);
    }
  });

  onMount(() => {
    scrollToBottom();
  });

  let clientX = $state(0);
  let clientY = $state(0);
  let visibleDropdown = $state<string | null>(null);
  let reactionPaletteVisibleFor = $state<string | null>(null);
  const modalManager = new ModalManager();

  document.addEventListener("click", () => {
    visibleDropdown = null;
  });
</script>

<Modal manager={modalManager} />

<div bind:this={messagesContainer} class="flex-1 space-y-2 overflow-y-auto p-4">
  {#if messages.data}
    {#each messages.data as message (message.id)}
      {#snippet reactionListSnippet()}
        <ReactionList {organizationId} messageId={message.id} />
      {/snippet}

      {#snippet dropdownContent()}
        <ul
          class="menu dropdown-content bg-base-100 absolute z-[1] w-40 rounded-md border p-2 shadow"
        >
          <li>
            <button onclick={() => (replyingTo = message)}>返信</button>
          </li>
          <li>
            <button
              onclick={(e) => {
                e.stopPropagation();
                reactionPaletteVisibleFor = message.id;
                visibleDropdown = null;
              }}>リアクションを付ける</button
            >
          </li>
          <li>
            <button onclick={() => modalManager.dispatch(reactionListSnippet)}
              >リアクションを表示</button
            >
          </li>
        </ul>
      {/snippet}
      <MessageDropdown
        x={clientX}
        y={clientY}
        visible={visibleDropdown === message.id}
      >
        {@render dropdownContent()}
      </MessageDropdown>

      {#if reactionPaletteVisibleFor && reactionPaletteVisibleFor === message.id}
        <EmojiPalette
          x={clientX}
          y={clientY}
          onClose={() => {
            reactionPaletteVisibleFor = null;
          }}
          onEmojiSelected={async (emoji) => {
            if (!reactionPaletteVisibleFor) return;
            await addReaction.run({
              messageId: reactionPaletteVisibleFor,
              emoji,
            });
            reactionPaletteVisibleFor = null;
          }}
        />
      {/if}

      <div
        role="button"
        tabindex="0"
        class="p-1 hover:bg-sky-900"
        oncontextmenu={(e) => {
          e.preventDefault();
          const menuWidth = 160; // w-40
          clientX =
            e.clientX + menuWidth > window.innerWidth
              ? e.clientX - menuWidth
              : e.clientX;
          clientY = e.clientY;
          visibleDropdown = message.id;
        }}
      >
        {#if message.parentId && messages.data.find((m) => m.id === message.parentId)}
          <div class="flex items-center gap-2">
            <span class="text-base-content/60 text-xs">返信</span>
            <span class="text-primary font-semibold"
              >{messagesById.get(message.parentId)?.author}</span
            >
            <span class="text-base-content/60 text-xs">
              {messagesById.get(message.parentId)?.content}
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

          <!-- Attachments -->
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
            <button
              class="btn btn-ghost btn-sm p-2"
              onclick={(e) => {
                e.stopPropagation();
                const menuWidth = 160; // w-40
                clientX =
                  e.clientX + menuWidth > window.innerWidth
                    ? e.clientX - menuWidth
                    : e.clientX;
                clientY = e.clientY;
                visibleDropdown = message.id;
              }}
            >
              <MdiDotsVertical />
            </button>
          </div>
          <ReactionButtons messageId={message.id} />
        </div>
      </div>
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

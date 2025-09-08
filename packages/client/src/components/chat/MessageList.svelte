<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import type { Doc } from "@packages/convex/src/convex/_generated/dataModel";
  import { useQuery } from "convex-svelte";
  import { onMount } from "svelte";
  import Modal, { ModalManager } from "$lib/modal/modal.svelte";
  import MdiDotsVertical from "~/icons/mdi-dots-vertical.svelte";
  import { useMutation } from "~/lib/useMutation.svelte";
  import EmojiPalette from "./EmojiPalette.svelte";
  import MessageDropdown from "./MessageDropdown.svelte";
  import ReactionButtons from "./ReactionButtons.svelte";
  import ReactionList from "./ReactionList.svelte";

  interface Props {
    channelId: Id<"channels">;
    replyingTo: Doc<"messages"> | null;
  }

  let { channelId, replyingTo = $bindable() }: Props = $props();

  const messages = useQuery(api.messages.list, () => ({
    channelId,
  }));

  const addReaction = useMutation(api.messages.addReaction);

  const messagesById = $derived(
    new Map(messages.data?.map((message) => [message._id, message])),
  );

  let messagesContainer: HTMLDivElement;

  function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString("ja-JP", {
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
  let visibleDropdown = $state<Id<"messages"> | null>(null);
  let reactionPaletteVisibleFor = $state<Id<"messages"> | null>(null);
  const modalManager = new ModalManager();
  document.addEventListener("click", () => {
    visibleDropdown = null;
  });
</script>

<Modal manager={modalManager} />

<div bind:this={messagesContainer} class="flex-1 space-y-2 overflow-y-auto p-4">
  {#if messages.data}
    {#each messages.data as message (message._id)}
      {#snippet reactionListSnippet()}
        <ReactionList messageId={message._id} />
      {/snippet}

      {#snippet dropdownContent()}
        <ul
          class="menu dropdown-content bg-base-100 absolute z-[1] w-40 rounded-md border p-2 shadow"
        >
          <li>
            <button onclick={() => (replyingTo = message)}>返信</button>
          </li>
          <li>
            <button onclick={() => (reactionPaletteVisibleFor = message._id)}
              >リアクションを付ける</button
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
        visible={visibleDropdown === message._id}
      >
        {@render dropdownContent()}
      </MessageDropdown>

      {#if reactionPaletteVisibleFor && reactionPaletteVisibleFor === message._id}
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
          clientX = e.clientX;
          clientY = e.clientY;
          visibleDropdown = message._id;
        }}
      >
        {#if message.parentId && messages.data.find((m) => m._id === message.parentId)}
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
          <ReactionButtons messageId={message._id} />
          <div
            class="bg-base-100 absolute top-4 right-4 -translate-y-1/2 rounded-md border opacity-0 group-hover:opacity-100"
          >
            <button
              class="btn btn-ghost btn-sm p-2"
              onclick={(e) => {
                e.stopPropagation();
                visibleDropdown = message._id;
                clientX = e.clientX - 150; // TODO: 暫定的なので直す
                clientY = e.clientY;
              }}
            >
              <MdiDotsVertical />
            </button>
          </div>
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

<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import type { Doc } from "@packages/convex/src/convex/_generated/dataModel";
  import { useQuery } from "convex-svelte";
  import { onMount } from "svelte";

  interface Props {
    channelId: Id<"channels">;
    replyingTo: Doc<"messages"> | null;
  }

  let { channelId, replyingTo = $bindable() }: Props = $props();

  const messages = useQuery(api.messages.list, () => ({
    channelId,
  }));

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
</script>

<div bind:this={messagesContainer} class="flex-1 space-y-2 overflow-y-auto p-4">
  {#if messages.data}
    {#each messages.data as message (message._id)}
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
        <div
          class="bg-base-100 absolute top-0 right-4 -translate-y-1/2 rounded-md border opacity-0 group-hover:opacity-100"
        >
          <div class="dropdown dropdown-end">
            <button class="btn btn-ghost btn-sm p-2" tabindex="0"> ⋮ </button>
            <ul
              tabindex="0"
              role="menu"
              class="menu dropdown-content bg-base-100 z-[1] w-40 rounded-md border p-2 shadow"
            >
              <li>
                <button onclick={() => (replyingTo = message)}>返信</button>
              </li>
            </ul>
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

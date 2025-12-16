<script lang="ts">
  import type { Message } from "@apps/api-client";
  import MdiPin from "@/icons/mdi-pin.svelte";
  import { getApiClient, unwrapResponse, useQuery } from "@/lib/api.svelte";

  interface Props {
    channelId: string;
  }

  let { channelId }: Props = $props();

  const api = getApiClient();

  const pinnedMessages = useQuery<Message[]>(async () => {
    const response = await api.messages.pins.get({
      query: { channelId },
    });
    return unwrapResponse(response);
  });

  function formatTime(timestamp: Date | number | string) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function scrollToMessage(messageId: string) {
    const element = document.getElementById(`message-${messageId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
</script>

{#if pinnedMessages.data && pinnedMessages.data.length > 0}
  <div class="bg-base-200 border-b p-2">
    <div class="text-warning mb-2 flex items-center gap-2">
      <MdiPin class="h-4 w-4" />
      <span class="text-sm font-semibold">ピン留めされたメッセージ</span>
    </div>
    <div class="space-y-1">
      {#each pinnedMessages.data as message}
        <button
          class="hover:bg-base-300 w-full rounded p-2 text-left transition-colors"
          onclick={() => scrollToMessage(message.id)}
        >
          <div class="flex items-baseline gap-2">
            <span class="text-primary text-sm font-semibold">
              {message.author}
            </span>
            <span class="text-base-content/60 text-xs">
              {formatTime(message.createdAt)}
            </span>
          </div>
          <div class="text-base-content/80 truncate text-sm">
            {message.content}
          </div>
        </button>
      {/each}
    </div>
  </div>
{/if}

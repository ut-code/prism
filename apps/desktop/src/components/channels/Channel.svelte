<script lang="ts">
  import type { Channel as ChannelType, Message } from "@apps/api-client";
  import { onMount } from "svelte";
  import {
    getApiClient,
    getChannel,
    unwrapResponse,
    useQuery,
  } from "@/lib/api.svelte";
  import MessageInput from "../chat/MessageInput.svelte";
  import MessageList from "../chat/MessageList.svelte";
  import type { SearchResult } from "../chat/messageSearch.svelte.ts";
  import PinnedMessages from "../chat/PinnedMessages.svelte";
  import SearchResults from "../chat/SearchResults.svelte";

  const api = getApiClient();

  interface Props {
    selectedChannelId: string;
    organizationId: string;
  }

  let { selectedChannelId, organizationId }: Props = $props();

  const selectedChannel = useQuery<ChannelType>(async () => {
    const response = await getChannel(api, selectedChannelId).get();
    return unwrapResponse(response);
  });

  let replyingTo = $state<Message | null>(null);
  let searchQuery = $state("");
  let searchResults = $state<SearchResult[]>([]);
  let isSearching = $state(false);

  async function handleSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }

    isSearching = true;
    try {
      const response = await api.messages.search.get({
        query: { q: searchQuery, channelId: selectedChannelId },
      });
      searchResults = unwrapResponse(response) as SearchResult[];
    } catch (error) {
      console.error("Search failed:", error);
      searchResults = [];
    } finally {
      isSearching = false;
    }
  }

  function handleResultClick(messageId: string) {
    const messageEl = document.getElementById(`message-${messageId}`);
    if (messageEl) {
      messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
      messageEl.classList.add("ring-2", "ring-primary");
      setTimeout(() => {
        messageEl.classList.remove("ring-2", "ring-primary");
      }, 2000);
    }
    searchQuery = "";
    searchResults = [];
  }

  async function markChannelAsRead() {
    try {
      // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
      await api.channels[selectedChannelId].read.post({});
    } catch (error) {
      console.error("Failed to mark channel as read:", error);
    }
  }

  onMount(() => {
    markChannelAsRead();
  });
</script>

<div class="border-base-300 bg-base-200 border-b p-4">
  <div class="mb-3 flex items-center gap-3">
    <h1 class="text-xl font-semibold">
      # {selectedChannel.data?.name}
    </h1>
    <div class="relative max-w-md flex-1">
      <input
        type="text"
        placeholder="メッセージを検索..."
        class="input input-sm input-bordered w-full"
        bind:value={searchQuery}
        onkeydown={(e) => e.key === "Enter" && handleSearch()}
      />
      {#if isSearching}
        <span class="loading loading-spinner loading-xs absolute top-2 right-2"
        ></span>
      {/if}
    </div>
  </div>
  {#if selectedChannel.data?.description}
    <p class="text-base-content/70 text-sm">
      {selectedChannel.data?.description}
    </p>
  {/if}
  {#if searchResults.length > 0}
    <div class="mt-3">
      <SearchResults
        results={searchResults}
        onResultClick={handleResultClick}
      />
    </div>
  {/if}
</div>

<PinnedMessages channelId={selectedChannelId} />
<MessageList {organizationId} channelId={selectedChannelId} bind:replyingTo />
<MessageInput channelId={selectedChannelId} {organizationId} bind:replyingTo />

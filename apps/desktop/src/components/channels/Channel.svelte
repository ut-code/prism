<script lang="ts">
  import type { Channel as ChannelType, Message } from "@apps/api-client";
  import { onMount } from "svelte";
  import {
    getApiClient,
    getChannel,
    unwrapResponse,
    useQuery,
  } from "@/lib/api.svelte";
  import MdiMagnify from "~icons/mdi/magnify";
  import MdiPound from "~icons/mdi/pound";
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
  let showSearch = $state(false);

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
    } catch {
      searchResults = [];
    } finally {
      isSearching = false;
    }
  }

  function handleResultClick(messageId: string) {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary");
      setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 2000);
    }
    searchQuery = "";
    searchResults = [];
    showSearch = false;
  }

  async function markChannelAsRead() {
    try {
      // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
      await api.channels[selectedChannelId].read.post({});
    } catch {
      // Ignore errors
    }
  }

  onMount(() => {
    markChannelAsRead();
  });
</script>

<div class="flex h-full flex-col">
  <!-- Channel header -->
  <header
    class="border-subtle flex items-center justify-between border-b px-6 py-4"
  >
    <div class="flex items-center gap-3">
      <MdiPound class="h-5 w-5 opacity-50" />
      <h1 class="text-base font-semibold">
        {selectedChannel.data?.name ?? "..."}
      </h1>
      {#if selectedChannel.data?.description}
        <span class="hidden text-sm opacity-40 sm:inline">
          — {selectedChannel.data.description}
        </span>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      {#if showSearch}
        <div
          class="animate-in fade-in slide-in-from-right-2 relative duration-200"
        >
          <input
            type="text"
            placeholder="メッセージを検索..."
            class="input input-sm input-bordered bg-base-200 w-56 pr-8 text-sm transition-all duration-150 focus:w-64"
            bind:value={searchQuery}
            onkeydown={(e) => e.key === "Enter" && handleSearch()}
          />
          {#if isSearching}
            <span
              class="loading loading-spinner loading-xs absolute top-2 right-2"
            ></span>
          {/if}
        </div>
      {/if}
      <button
        class="btn btn-ghost btn-sm btn-square transition-all duration-150"
        title="検索"
        onclick={() => (showSearch = !showSearch)}
      >
        <MdiMagnify
          class="h-5 w-5 opacity-50 transition-opacity duration-150 hover:opacity-80"
        />
      </button>
    </div>
  </header>

  <!-- Search results -->
  {#if searchResults.length > 0}
    <div class="border-subtle bg-base-200/50 border-b p-2">
      <SearchResults
        results={searchResults}
        onResultClick={handleResultClick}
      />
    </div>
  {/if}

  <!-- Pinned messages -->
  <PinnedMessages channelId={selectedChannelId} />

  <!-- Messages -->
  <div class="flex-1 overflow-y-auto">
    <MessageList
      {organizationId}
      channelId={selectedChannelId}
      bind:replyingTo
    />
  </div>

  <!-- Input -->
  <MessageInput
    channelId={selectedChannelId}
    {organizationId}
    bind:replyingTo
  />
</div>

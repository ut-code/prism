<script lang="ts">
  import Hash from "@lucide/svelte/icons/hash";
  import Search from "@lucide/svelte/icons/search";
  import MessageInput from "../chat/MessageInput.svelte";
  import MessageList from "../chat/MessageList.svelte";
  import PinnedMessages from "../chat/PinnedMessages.svelte";
  import SearchResults from "../chat/SearchResults.svelte";
  import { createChannelController } from "./channel.svelte.ts";

  interface Props {
    selectedChannelId: string;
    organizationId: string;
  }

  let { selectedChannelId, organizationId }: Props = $props();

  const controller = createChannelController(
    () => selectedChannelId,
    () => organizationId,
  );

  function autofocus(node: HTMLElement) {
    node.focus();
  }
</script>

<div class="flex h-full flex-col">
  <!-- Channel header -->
  <header
    class="border-subtle flex items-center justify-between border-b px-6 py-4"
  >
    <div class="flex items-center gap-4">
      <Hash class="size-5 opacity-60" />
      <h1 class="text-base font-semibold">
        {controller.selectedChannel.data?.name ?? "..."}
      </h1>
      {#if controller.selectedChannel.data?.description}
        <span class="hidden text-sm opacity-60 sm:inline">
          — {controller.selectedChannel.data.description}
        </span>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      {#if controller.showSearch}
        <div
          class="animate-in fade-in slide-in-from-right-2 relative duration-200"
        >
          <input
            type="text"
            placeholder="Search messages..."
            class="input input-sm input-bordered bg-base-200 w-56 pr-8 text-sm transition-all duration-200 focus:w-64"
            bind:value={controller.searchQuery}
            onkeydown={(e) => e.key === "Enter" && controller.handleSearch()}
            use:autofocus
          />
          {#if controller.isSearching}
            <span
              class="loading loading-spinner loading-xs absolute top-2 right-2"
            ></span>
          {/if}
        </div>
      {/if}
      <button
        class="btn btn-ghost btn-sm btn-square transition-all duration-200"
        title="Search"
        onclick={() => (controller.showSearch = !controller.showSearch)}
      >
        <Search
          class="size-5 opacity-60 transition-opacity duration-200 hover:opacity-80"
        />
      </button>
    </div>
  </header>

  <!-- Search results -->
  {#if controller.searchResults.length > 0}
    <div class="border-subtle bg-base-200/50 border-b p-4">
      <SearchResults
        results={controller.searchResults}
        onResultClick={controller.handleResultClick}
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
      bind:replyingTo={controller.replyingTo}
    />
  </div>

  <!-- Input -->
  <MessageInput
    channelId={selectedChannelId}
    {organizationId}
    bind:replyingTo={controller.replyingTo}
  />
</div>

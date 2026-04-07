<script lang="ts">
  import Hash from "@lucide/svelte/icons/hash";
  import Search from "@lucide/svelte/icons/search";
  import Users from "@lucide/svelte/icons/users";
  import type { Channel } from "@packages/api-client";

  interface Props {
    channels: Channel[];
    isOpen: boolean;
    onClose: () => void;
    onJoin: (channelId: string) => void;
  }

  let { channels, isOpen, onClose, onJoin }: Props = $props();

  let dialog: HTMLDialogElement | null = $state(null);
  let searchQuery = $state("");
  let showJoined = $state(false);

  const filteredChannels = $derived(
    channels
      .filter((ch) => ch.type === "public")
      .filter((ch) => (showJoined ? ch.joined : !ch.joined))
      .filter((ch) =>
        ch.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  $effect(() => {
    if (isOpen) {
      searchQuery = "";
      showJoined = false;
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  });

  function handleJoin(channelId: string) {
    onJoin(channelId);
  }
</script>

<dialog bind:this={dialog} class="modal" onclose={onClose}>
  <div class="modal-box max-w-lg">
    <h3 class="mb-4 text-lg font-medium">Browse Channels</h3>

    <div class="mb-4 flex items-center gap-2">
      <div class="relative flex-1">
        <Search
          class="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <input
          type="text"
          placeholder="Search channels..."
          class="input input-bordered w-full pl-10"
          bind:value={searchQuery}
        />
      </div>
    </div>

    <div class="mb-4">
      <div class="tabs tabs-box">
        <button
          type="button"
          class={["tab", !showJoined && "tab-active"]}
          onclick={() => (showJoined = false)}
        >
          Available
        </button>
        <button
          type="button"
          class={["tab", showJoined && "tab-active"]}
          onclick={() => (showJoined = true)}
        >
          Joined
        </button>
      </div>
    </div>

    <div class="max-h-64 overflow-y-auto">
      {#if filteredChannels.length === 0}
        <div class="text-muted py-8 text-center text-sm">
          {#if showJoined}
            No joined channels
          {:else}
            No available channels to join
          {/if}
        </div>
      {:else}
        <ul class="flex flex-col gap-1">
          {#each filteredChannels as channel (channel.id)}
            <li
              class="hover:bg-base-200 flex items-center justify-between rounded-lg px-3 py-2"
            >
              <div class="flex items-center gap-2">
                <Hash class="text-muted size-4" />
                <span class="font-medium">{channel.name}</span>
                {#if channel.description}
                  <span class="text-muted text-sm">{channel.description}</span>
                {/if}
              </div>
              <div class="flex items-center gap-3">
                <span class="text-muted flex items-center gap-1 text-xs">
                  <Users class="size-3" />
                  {channel.memberCount}
                </span>
                {#if !channel.joined}
                  <button
                    type="button"
                    class="btn btn-primary btn-xs"
                    onclick={() => handleJoin(channel.id)}
                  >
                    Join
                  </button>
                {:else}
                  <span class="text-success text-xs">Joined</span>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div class="modal-action">
      <button type="button" class="btn btn-ghost btn-sm" onclick={onClose}>
        Close
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button type="submit">close</button>
  </form>
</dialog>

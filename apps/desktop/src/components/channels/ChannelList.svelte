<script lang="ts">
  import type { Channel } from "@apps/api-client";
  import { onMount } from "svelte";
  import { getApiClient, unwrapResponse, useQuery } from "@/lib/api.svelte";
  import { UnreadManager } from "@/lib/unread.svelte";
  import { useWebSocket } from "@/lib/websocket";
  import type { Selection } from "$components/chat/types";
  import DMList from "$components/dms/DMList.svelte";
  import UserSearch from "$components/dms/UserSearch.svelte";
  import MdiAccount from "~icons/mdi/account";
  import MdiPlus from "~icons/mdi/plus";
  import MdiPound from "~icons/mdi/pound";
  import CreateChannelButton from "./CreateChannelButton.svelte";

  const api = getApiClient();

  interface Props {
    organizationId: string;
    screenMode: Selection;
  }

  let { organizationId, screenMode = $bindable() }: Props = $props();

  const channels = useQuery<Channel[]>(async () => {
    const response = await api.channels.get({ query: { organizationId } });
    return unwrapResponse(response);
  });

  const unreadManager = $derived(new UnreadManager(api, organizationId));
  let showUserSearch = $state(false);

  // WebSocket: refresh unread counts on new messages (auto-cleanup)
  const ws = useWebSocket();
  ws.on("message:created", () => {
    unreadManager.fetchUnreadCounts();
  });

  onMount(() => {
    unreadManager.fetchUnreadCounts();
  });
</script>

<div class="flex h-full flex-col">
  <!-- Channels section -->
  <section class="flex-1 overflow-y-auto">
    <header class="flex items-center justify-between px-3 py-2">
      <span class="text-muted text-xs font-medium tracking-wider uppercase">
        Channels
      </span>
      <CreateChannelButton {organizationId} />
    </header>

    <nav class="px-2">
      {#if channels.data}
        {#each channels.data as channel (channel.id)}
          {@const active =
            screenMode.type === "chat" &&
            screenMode.selectedChannelId === channel.id}
          {@const unreadCount = unreadManager.getUnreadCount(channel.id)}
          <a
            href={`/orgs/${organizationId}/chat/${channel.id}`}
            class={[
              "group flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-base-content/80 hover:bg-base-300 hover:text-base-content",
            ]}
          >
            <MdiPound
              class={[
                "h-4 w-4 flex-shrink-0",
                active ? "text-primary" : "text-muted",
              ]}
            />
            <span class={["flex-1 truncate", unreadCount > 0 && "font-medium"]}>
              {channel.name}
            </span>
            {#if unreadCount > 0}
              <span
                class="badge-unread flex items-center justify-center rounded-full"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            {/if}
          </a>
        {/each}
      {:else}
        <div class="text-muted px-2 py-4 text-center text-sm">
          読み込み中...
        </div>
      {/if}

      {#if channels.data?.length === 0}
        <div class="text-muted px-2 py-4 text-center text-sm">
          チャンネルがありません
        </div>
      {/if}
    </nav>
  </section>

  <!-- DM section -->
  <section class="border-subtle border-t">
    <header class="flex items-center justify-between px-3 py-2">
      <span class="text-muted text-xs font-medium tracking-wider uppercase">
        Direct Messages
      </span>
      <button
        class="btn btn-ghost btn-xs btn-square"
        title="新しいDM"
        onclick={() => (showUserSearch = !showUserSearch)}
      >
        <MdiPlus class="text-muted h-4 w-4" />
      </button>
    </header>

    {#if showUserSearch}
      <div class="px-2 pb-2">
        <UserSearch {organizationId} />
      </div>
    {/if}

    <div class="max-h-48 overflow-y-auto px-2 pb-2">
      <DMList
        {organizationId}
        selectedChannelId={screenMode.type === "chat"
          ? screenMode.selectedChannelId
          : undefined}
      />
    </div>
  </section>

  <!-- Settings link -->
  <footer class="border-subtle border-t p-2">
    <a
      href={`/orgs/${organizationId}/personalization`}
      class="text-muted hover:bg-base-300 hover:text-base-content flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors"
    >
      <MdiAccount class="h-4 w-4" />
      <span>個人設定</span>
    </a>
  </footer>
</div>

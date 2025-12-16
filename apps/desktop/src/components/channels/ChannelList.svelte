<script lang="ts">
  import type { Channel } from "@apps/api-client";
  import { onMount } from "svelte";
  import { getApiClient, unwrapResponse, useQuery } from "@/lib/api.svelte";
  import { UnreadManager } from "@/lib/unread.svelte";
  import type { Selection } from "$components/chat/types";
  import DMList from "$components/dms/DMList.svelte";
  import UserSearch from "$components/dms/UserSearch.svelte";
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

  const unreadManager = new UnreadManager(api, organizationId);
  let showUserSearch = $state(false);

  onMount(() => {
    unreadManager.fetchUnreadCounts();
    const interval = setInterval(() => {
      unreadManager.fetchUnreadCounts();
    }, 30000);
    return () => clearInterval(interval);
  });
</script>

<div class="flex h-full flex-col">
  <div class="border-base-300 border-b p-4">
    <h3 class="text-base font-semibold">チャンネル</h3>
    <CreateChannelButton {organizationId} />
  </div>

  <div class="flex-1 overflow-y-auto">
    {#if channels.data}
      {#each channels.data as channel (channel.id)}
        {@const active =
          screenMode.type === "chat" &&
          screenMode.selectedChannelId === channel.id}
        {@const unreadCount = unreadManager.getUnreadCount(channel.id)}
        {@const hasUnread = unreadCount > 0}
        <a
          class={[
            "border-base-300 flex w-full items-center justify-between border-b p-3 text-left",
            active ? "bg-primary text-primary-content" : "hover:bg-base-300",
          ]}
          href={`/orgs/${organizationId}/chat/${channel.id}`}
        >
          <div class="flex flex-1 flex-col">
            <span class={["font-medium", hasUnread && "font-bold"]}>
              # {channel.name}
            </span>
            {#if channel.description}
              <span class="text-sm opacity-70">{channel.description}</span>
            {/if}
          </div>
          {#if hasUnread}
            <span class="badge badge-primary badge-sm">{unreadCount}</span>
          {/if}
        </a>
      {/each}
    {:else}
      <div class="text-base-content/60 p-4 text-center">
        チャンネルを読み込み中...
      </div>
    {/if}

    {#if channels.data && channels.data.length === 0}
      <div class="text-base-content/60 p-4 text-center text-sm">
        まだチャンネルがありません
      </div>
    {/if}
  </div>
  <div class="border-base-300 border-t">
    <div class="border-base-300 flex items-center justify-between border-b p-4">
      <h3 class="text-base font-semibold">DM</h3>
      <button
        class="btn btn-ghost btn-sm btn-circle"
        aria-label="新しいDMを開始"
        onclick={() => (showUserSearch = !showUserSearch)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="inline-block h-5 w-5 stroke-current"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
      </button>
    </div>

    {#if showUserSearch}
      <UserSearch {organizationId} />
    {/if}

    <DMList
      {organizationId}
      selectedChannelId={screenMode.type === "chat"
        ? screenMode.selectedChannelId
        : undefined}
    />
  </div>

  <a
    class="btn btn-primary mt-auto mb-2 w-full"
    href={`/orgs/${organizationId}/personalization`}>個人用設定</a
  >
</div>

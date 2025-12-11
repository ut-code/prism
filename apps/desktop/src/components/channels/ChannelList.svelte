<script lang="ts">
  import type { Channel } from "@apps/api-client";
  import { getApiClient, useQuery } from "@/lib/api.svelte";
  import type { Selection } from "$components/chat/types";
  import CreateChannelButton from "./CreateChannelButton.svelte";

  const api = getApiClient();

  interface Props {
    organizationId: string;
    screenMode: Selection;
  }

  let { organizationId, screenMode = $bindable() }: Props = $props();

  const channels = useQuery<Channel[]>(async () => {
    const response = await api.channels.get({ query: { organizationId } });
    if (response.error) {
      throw new Error(
        typeof response.error.value === "string"
          ? response.error.value
          : JSON.stringify(response.error.value),
      );
    }
    if (!response.data) {
      throw new Error("No channel data returned");
    }
    return response.data;
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
        <a
          class={[
            "border-base-300 block w-full border-b p-3 text-left",
            active ? "bg-primary text-primary-content" : "hover:bg-base-300",
          ]}
          href={`/orgs/${organizationId}/chat/${channel.id}`}
        >
          <span class="font-medium"># {channel.name}</span>
          {#if channel.description}
            <span class="text-sm opacity-70">{channel.description}</span>
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
  <a
    class="btn btn-primary mt-auto mb-2 w-full"
    href={`/orgs/${organizationId}/personalization`}>個人用設定</a
  >
</div>

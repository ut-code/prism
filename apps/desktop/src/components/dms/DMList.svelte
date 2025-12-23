<script lang="ts">
  import type { Channel } from "@apps/api-client";
  import { getApiClient, unwrapResponse, useQuery } from "@/lib/api.svelte";

  interface Props {
    organizationId: string;
    selectedChannelId?: string;
  }

  const { organizationId, selectedChannelId }: Props = $props();
  const api = getApiClient();

  const dms = useQuery<Channel[]>(async () => {
    const response = await api.dms.get();
    return unwrapResponse(response);
  });
</script>

<div class="flex flex-col">
  <div class="border-base-300 border-b p-4">
    <h3 class="text-base font-semibold">ダイレクトメッセージ</h3>
  </div>

  <div class="flex-1 overflow-y-auto">
    {#if dms.data}
      {#each dms.data as dm (dm.id)}
        {@const active = selectedChannelId === dm.id}
        <a
          class={[
            "border-base-300 block w-full border-b p-3 text-left",
            active ? "bg-primary text-primary-content" : "hover:bg-base-300",
          ]}
          href={`/orgs/${organizationId}/chat/${dm.id}`}
        >
          <span class="font-medium">{dm.name}</span>
        </a>
      {/each}
    {:else}
      <div class="text-base-content/60 p-4 text-center">読み込み中...</div>
    {/if}

    {#if dms.data && dms.data.length === 0}
      <div class="text-base-content/60 p-4 text-center text-sm">
        DMはまだありません
      </div>
    {/if}
  </div>
</div>

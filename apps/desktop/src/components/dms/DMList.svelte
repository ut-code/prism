<script lang="ts">
  import type { Channel } from "@packages/api-client";
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
  <div class="flex-1 overflow-y-auto">
    {#if dms.data}
      {#each dms.data as dm (dm.id)}
        {@const active = selectedChannelId === dm.id}
        <a
          class={[
            "block w-full rounded px-2 py-2 text-left text-sm transition-colors duration-200",
            active
              ? "bg-primary/15 text-primary"
              : "text-base-content/80 hover:bg-base-300",
          ]}
          href={`/orgs/${organizationId}/chat/${dm.id}`}
        >
          <span class="font-medium">{dm.name}</span>
        </a>
      {/each}
    {:else}
      <div class="text-base-content p-4 text-center opacity-60">
        読み込み中...
      </div>
    {/if}

    {#if dms.data && dms.data.length === 0}
      <div class="text-base-content p-4 text-center text-sm opacity-60">
        DMはまだありません
      </div>
    {/if}
  </div>
</div>

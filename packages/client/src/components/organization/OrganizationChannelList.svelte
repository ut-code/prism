<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useConvexClient, useQuery } from "convex-svelte";

  interface Props {
    organizationId: Id<"organizations">;
    selectedChannelId?: Id<"channels">;
  }

  let { organizationId, selectedChannelId = $bindable(undefined) }: Props =
    $props();

  const convex = useConvexClient();
  const channels = useQuery(api.channels.list, () => ({
    organizationId,
  }));

  async function createChannel() {
    const name = prompt("チャンネル名を入力してください:");
    if (name?.trim()) {
      await convex.mutation(api.channels.create, {
        name: name.trim(),
        organizationId,
      });
    }
  }
</script>

<div class="flex h-full flex-col">
  <div class="border-base-300 border-b p-4">
    <h3 class="text-base font-semibold">チャンネル</h3>
    <button class="btn btn-primary btn-sm mt-2 w-full" onclick={createChannel}>
      + 新しいチャンネル
    </button>
  </div>

  <div class="flex-1 overflow-y-auto">
    {#if channels.data}
      {#each channels.data as channel (channel._id)}
        <button
          class={[
            "border-base-300 w-full border-b p-3 text-left",
            selectedChannelId === channel._id
              ? "bg-primary text-primary-content"
              : "hover:bg-base-300",
          ].join(" ")}
          onclick={() => (selectedChannelId = channel._id)}
        >
          <div class="font-medium"># {channel.name}</div>
          {#if channel.description}
            <div class="text-sm opacity-70">{channel.description}</div>
          {/if}
        </button>
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
</div>

<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useConvexClient, useQuery } from "convex-svelte";

  interface Props {
    selectedChannelId?: Id<"channels">;
    screenMode: string;
  }

  let {
    selectedChannelId = $bindable(undefined),
    screenMode = $bindable(),
  }: Props = $props();

  const convex = useConvexClient();
  const channels = useQuery(api.channels.list, () => ({}));

  async function createChannel() {
    const name = prompt("チャンネル名を入力してください:");
    if (name?.trim()) {
      await convex.mutation(api.channels.create, { name: name.trim() });
    }
  }
</script>

<div class="bg-base-200 flex h-full w-64 flex-col">
  <div class="border-base-300 border-b p-4">
    <h2 class="text-lg font-semibold">チャンネル</h2>
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
          onclick={() => {
            selectedChannelId = channel._id;
            screenMode = "chat";
          }}
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
  </div>
  <button
    class="btn btn-primary mt-auto mb-2 w-full"
    onclick={() => {
      screenMode = "personalization";
    }}>個人用設定</button
  >
</div>

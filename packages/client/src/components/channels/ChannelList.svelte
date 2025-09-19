<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useQuery } from "convex-svelte";
  import CreateChannelButton from "./CreateChannelButton.svelte";

  type Selection =
    | { type: "chat"; selectedChannelId: Id<"channels"> | undefined }
    | { type: "personalization"; selectedChannelId: undefined };

  interface Props {
    organizationId: Id<"organizations">;
    screenMode: Selection;
  }

  let { organizationId, screenMode = $bindable() }: Props = $props();

  const channels = useQuery(api.channels.list, () => ({
    organizationId,
  }));
</script>

<div class="flex h-full flex-col">
  <div class="border-base-300 border-b p-4">
    <h3 class="text-base font-semibold">チャンネル</h3>
    <CreateChannelButton {organizationId} />
  </div>

  <div class="flex-1 overflow-y-auto">
    {#if channels.data}
      {#each channels.data as channel (channel._id)}
        <button
          class={[
            "border-base-300 w-full border-b p-3 text-left",
            screenMode.selectedChannelId === channel._id
              ? "bg-primary text-primary-content"
              : "hover:bg-base-300",
          ].join(" ")}
          onclick={() => {
            screenMode = { type: "chat", selectedChannelId: channel._id };
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

    {#if channels.data && channels.data.length === 0}
      <div class="text-base-content/60 p-4 text-center text-sm">
        まだチャンネルがありません
      </div>
    {/if}
  </div>
  <button
    class="btn btn-primary mt-auto mb-2 w-full"
    onclick={() => {
      screenMode = { type: "personalization", selectedChannelId: undefined };
    }}>個人用設定</button
  >
</div>

<script lang="ts">
  import { type Id } from "@packages/convex";
  import Channel from "./Channel.svelte";
  import ChannelList from "./ChannelList.svelte";
  import Personalization from "./Personalization.svelte";

  type Selection = {type: "chat", selectedChannelId: Id<"channels"> | undefined} | {type: "personalization", selectedChannelId: undefined};

  //let selectedChannelId = $state<Id<"channels"> | undefined>(undefined);
  let screenMode = $state<Selection>({type: "chat", selectedChannelId: undefined});
</script>

<div class="bg-base-100 flex h-screen">
  <ChannelList bind:screenMode />
  <div class="flex flex-1 flex-col">
    {#if screenMode.type == "chat"}
      {#if screenMode.selectedChannelId}
        <Channel selectedChannelId= {screenMode.selectedChannelId}/>
      {:else}
        <div class="bg-base-200 flex flex-1 items-center justify-center">
          <div class="text-center">
            <h2 class="text-base-content/60 mb-2 text-2xl font-semibold">
              チャットアプリへようこそ
            </h2>
            <p class="text-base-content/50">
              左からチャンネルを選択して会話を始めましょう
            </p>
          </div>
        </div>
      {/if}
    {:else if screenMode.type == "personalization"}
      <Personalization />
    {/if}
  </div>
</div>

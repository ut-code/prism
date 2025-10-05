<script lang="ts">
  import { api, type Doc, type Id } from "@packages/convex";
  import { useQuery } from "convex-svelte";
  import MessageInput from "../chat/MessageInput.svelte";
  import MessageList from "../chat/MessageList.svelte";

  interface Props {
    selectedChannelId: Id<"channels">;
    organizationId: Id<"organizations">;
  }

  let { selectedChannelId, organizationId }: Props = $props();

  const selectedChannel = useQuery(api.channels.get, () => ({
    channelId: selectedChannelId,
  }));

  let replyingTo = $state<Doc<"messages"> | null>(null);
</script>

<div class="border-base-300 bg-base-200 border-b p-4">
  <h1 class="text-xl font-semibold">
    # {selectedChannel.data?.name}
  </h1>
  {#if selectedChannel.data?.description}
    <p class="text-base-content/70 mt-1 text-sm">
      {selectedChannel.data?.description}
    </p>
  {/if}
</div>

<MessageList {organizationId} channelId={selectedChannelId} bind:replyingTo />
<MessageInput channelId={selectedChannelId} {organizationId} bind:replyingTo />

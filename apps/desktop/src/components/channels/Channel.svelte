<script lang="ts">
  import type { Channel as ChannelType, Message } from "@apps/api-client";
  import {
    getApiClient,
    getChannel,
    unwrapResponse,
    useQuery,
  } from "@/lib/api.svelte";
  import MessageInput from "../chat/MessageInput.svelte";
  import MessageList from "../chat/MessageList.svelte";

  const api = getApiClient();

  interface Props {
    selectedChannelId: string;
    organizationId: string;
  }

  let { selectedChannelId, organizationId }: Props = $props();

  const selectedChannel = useQuery<ChannelType>(async () => {
    const response = await getChannel(api, selectedChannelId).get();
    return unwrapResponse(response);
  });

  let replyingTo = $state<Message | null>(null);
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

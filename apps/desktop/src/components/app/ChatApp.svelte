<script lang="ts">
  import type { Organization } from "@packages/api-client";
  import {
    getApiClient,
    getOrganization,
    unwrapResponse,
    useQuery,
  } from "@/lib/api.svelte";
  import { goto } from "$app/navigation";
  import Channel from "../channels/Channel.svelte";
  import ChannelList from "../channels/ChannelList.svelte";
  import Personalization from "../chat/Personalization.svelte";
  import type { Selection } from "../chat/types.ts";
  import OrganizationSidebar from "./OrganizationSidebar.svelte";

  interface Props {
    organizationId: string;
    screenMode: Selection;
  }

  const { organizationId, screenMode }: Props = $props();
  const api = getApiClient();

  const organization = useQuery<Organization>(async () => {
    const response = await getOrganization(api, organizationId).get();
    return unwrapResponse(response);
  });

  function handleScreenModeChange(val: Selection) {
    if (val.type === "chat") {
      goto(`/orgs/${organizationId}/chat/${val.selectedChannelId}`);
    } else if (val.type === "personalization") {
      goto(`/orgs/${organizationId}/personalization`);
    }
  }
</script>

<div class="bg-base-100 flex h-screen">
  <OrganizationSidebar organization={organization.data} {organizationId}>
    <ChannelList
      {organizationId}
      bind:screenMode={() => screenMode, handleScreenModeChange}
    />
  </OrganizationSidebar>

  <main class="flex flex-1 flex-col overflow-hidden">
    {#if screenMode.type === "chat"}
      {#if screenMode.selectedChannelId}
        <Channel
          {organizationId}
          selectedChannelId={screenMode.selectedChannelId}
        />
      {:else}
        <div class="flex flex-1 items-center justify-center">
          <div class="text-center">
            <p class="text-muted text-lg">チャンネルを選択</p>
            <p class="text-muted mt-1 text-sm opacity-60">
              左のサイドバーからチャンネルを選んでください
            </p>
          </div>
        </div>
      {/if}
    {:else if screenMode.type === "personalization"}
      <Personalization />
    {/if}
  </main>
</div>

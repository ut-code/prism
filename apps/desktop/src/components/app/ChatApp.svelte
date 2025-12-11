<script lang="ts">
  import type { Organization } from "@apps/api-client";
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
</script>

<div class="bg-base-100 flex h-screen">
  <OrganizationSidebar organization={organization.data} {organizationId}>
    <ChannelList
      {organizationId}
      bind:screenMode={() => screenMode,
      (val) => {
        if (val.type === "chat") {
          goto(`/orgs/${organizationId}/chat/${val.selectedChannelId}`);
        } else if (val.type === "personalization") {
          goto(`/orgs/${organizationId}/personalization`);
        }
      }}
    />
  </OrganizationSidebar>

  <div class="flex flex-1 flex-col">
    {#if screenMode.type == "chat"}
      {#if screenMode.selectedChannelId}
        <Channel
          {organizationId}
          selectedChannelId={screenMode.selectedChannelId}
        />
      {:else}
        <div class="bg-base-200 flex flex-1 items-center justify-center">
          <div class="text-center">
            <h2 class="text-base-content/60 mb-2 text-2xl font-semibold">
              {organization.data?.name || "組織"}へようこそ
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

<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useQuery } from "convex-svelte";
  import Channel from "../chat/Channel.svelte";
  import OrganizationChannelList from "./OrganizationChannelList.svelte";

  interface Props {
    organizationId: Id<"organizations">;
    onOrganizationChange: () => void;
  }

  const { organizationId, onOrganizationChange }: Props = $props();

  let selectedChannelId = $state<Id<"channels"> | undefined>(undefined);

  const organization = useQuery(api.organizations.get, () => ({
    id: organizationId,
  }));
</script>

<div class="bg-base-100 flex h-screen">
  <div class="bg-base-200 border-base-300 w-80 border-r">
    <div class="border-base-300 border-b p-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base-content text-lg font-bold">
            {organization.data?.name || "組織"}
          </h2>
          {#if organization.data?.description}
            <p class="text-base-content/70 text-sm">
              {organization.data.description}
            </p>
          {/if}
        </div>
        <div class="dropdown dropdown-end">
          <div
            tabindex="0"
            role="button"
            class="btn btn-ghost btn-sm btn-circle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block h-4 w-4 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
              ></path>
            </svg>
          </div>
          <ul
            tabindex="0"
            class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
          >
            <li>
              <a href="/{organizationId}/settings">組織設定</a>
            </li>
            <li>
              <button onclick={onOrganizationChange}>組織を切り替え</button>
            </li>
          </ul>
        </div>
      </div>
      {#if organization.data?.permission}
        <div class="badge badge-outline mt-2 capitalize">
          {organization.data.permission}
        </div>
      {/if}
    </div>

    <OrganizationChannelList {organizationId} bind:selectedChannelId />
  </div>

  <div class="flex flex-1 flex-col">
    {#if selectedChannelId}
      <Channel {selectedChannelId} />
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
  </div>
</div>

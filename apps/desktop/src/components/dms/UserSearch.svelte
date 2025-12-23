<script lang="ts">
  import type { Channel, User } from "@packages/api-client";
  import { getApiClient, unwrapResponse } from "@/lib/api.svelte";

  interface Props {
    organizationId: string;
  }

  const { organizationId }: Props = $props();
  const api = getApiClient();

  let searchQuery = $state("");
  let users = $state<User[]>([]);
  let isSearching = $state(false);

  async function searchUsers() {
    if (!searchQuery.trim()) {
      users = [];
      return;
    }

    isSearching = true;
    try {
      const response = await api.users.search.get({
        query: { email: searchQuery },
      });
      users = unwrapResponse(response) || [];
    } catch {
      users = [];
    } finally {
      isSearching = false;
    }
  }

  async function createDM(userId: string) {
    try {
      const response = await api.dms.post({
        otherUserId: userId,
        organizationId,
      });
      const channel = unwrapResponse(response) as Channel | undefined;
      if (channel?.id) {
        window.location.href = `/orgs/${organizationId}/chat/${channel.id}`;
      }
    } catch (error) {
      console.error("Failed to create DM:", error);
    }
  }
</script>

<div class="p-4">
  <input
    type="text"
    placeholder="メールアドレスで検索..."
    class="input input-bordered w-full"
    bind:value={searchQuery}
    oninput={searchUsers}
  />

  {#if isSearching}
    <div class="text-base-content/60 mt-2 text-center text-sm">検索中...</div>
  {/if}

  {#if users.length > 0}
    <div class="mt-2 space-y-1">
      {#each users as user (user.id)}
        <button
          class="hover:bg-base-200 w-full rounded p-2 text-left"
          onclick={() => createDM(user.id)}
        >
          <div class="font-medium">{user.name || user.email}</div>
          {#if user.email}
            <div class="text-base-content/60 text-sm">{user.email}</div>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

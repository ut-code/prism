<script lang="ts">
  import type { Reaction } from "@apps/api-client";
  import { getApiClient, getMessage, unwrapResponse, useQuery } from "@/lib/api.svelte";
  import { uniqueBy } from "@/lib/utils";

  interface Props {
    organizationId: string;
    messageId: string;
  }

  let { organizationId, messageId }: Props = $props();

  const api = getApiClient();

  const reactions = useQuery<Reaction[]>(async () => {
    const response = await getMessage(api, messageId).reactions.get();
    return unwrapResponse(response);
  });

  let selectedEmoji = $state<string | null>(null);

  const reactionDetailsByEmoji = $derived.by(() => {
    const details = new Map<string, { count: number; users: string[] }>();
    if (!reactions.data) {
      return details;
    }
    for (const r of reactions.data) {
      details.set(r.emoji, {
        count: (details.get(r.emoji)?.count ?? 0) + 1,
        users: [...(details.get(r.emoji)?.users ?? []), r.userId],
      });
    }
    return details;
  });

  const allUserIdsInReactions = $derived(
    reactions.data
      ? uniqueBy(reactions.data, (r) => r.userId).map((r) => r.userId)
      : [],
  );

  const userNamesById = useQuery<Record<string, string>>(async () => {
    const response = await api.users.nicknames.post({ userIds: allUserIdsInReactions, organizationId });
    return unwrapResponse(response);
  });

  function toggleUserList(emoji: string) {
    selectedEmoji = emoji;
  }

  $effect(() => {
    if (!selectedEmoji && reactionDetailsByEmoji.size > 0) {
      selectedEmoji = reactionDetailsByEmoji.keys().next().value || null;
    }
  });
</script>

<div>
  {#if reactionDetailsByEmoji.size > 0}
    <div class="flex h-96 gap-4">
      <div class="flex w-24 flex-col gap-1 overflow-y-auto">
        {#each [...reactionDetailsByEmoji.entries()] as [emoji, detail]}
          <button
            class="btn btn-sm w-full"
            class:btn-primary={selectedEmoji === emoji}
            onclick={() => toggleUserList(emoji)}
          >
            <span class="text-xl">{emoji}</span>
            <span class="text-sm">{detail.count}</span>
          </button>
        {/each}
      </div>
      <div class="flex-1 overflow-y-auto">
        {#if selectedEmoji}
          <table class="table-sm table table-fixed">
            <tbody>
              {#if userNamesById.data && reactionDetailsByEmoji.get(selectedEmoji)}
                {@const userIdsForSelectedEmoji =
                  reactionDetailsByEmoji.get(selectedEmoji)?.users ?? []}
                {#if userIdsForSelectedEmoji.length === 0}
                  <tr>
                    <td>No one has reacted with this emoji.</td>
                  </tr>
                {/if}
                {#each userIdsForSelectedEmoji as userId}
                  <tr>
                    <td class="truncate">{userNamesById.data[userId]}</td>
                  </tr>
                {/each}
              {:else if userNamesById.isLoading || reactions.isLoading}
                <tr>
                  <td>Loading...</td>
                </tr>
              {:else}
                <tr>
                  <td>Error</td>
                </tr>
              {/if}
            </tbody>
          </table>
        {/if}
      </div>
    </div>
  {:else}
    <div class="flex h-96 items-center justify-center">
      <p>There are no reactions yet.</p>
    </div>
  {/if}
</div>

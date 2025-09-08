<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useQuery } from "convex-svelte";

  interface Props {
    messageId: Id<"messages">;
  }

  let { messageId }: Props = $props();

  const reactions = useQuery(api.messages.getReactions, () => ({ messageId }));

  let selectedEmoji = $state<string | null>(null);

  const reactionDetailsByEmoji = $derived.by(() => {
    const details = new Map<string, { count: number; users: Id<"users">[] }>();
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
    reactions.data ? [...new Set(reactions.data.map((r) => r.userId))] : [],
  );

  const userNamesById = useQuery(api.users.getUserNames, () => ({
    userIds: allUserIdsInReactions,
  }));

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
    <div class="flex h-96 gap-4 py-4">
      <div class="flex w-24 flex-col gap-1 overflow-y-auto pr-2">
        {#each [...reactionDetailsByEmoji.entries()] as [emoji, detail]}
          <button
            class="btn btn-sm w-full"
            class:btn-active={selectedEmoji === emoji}
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

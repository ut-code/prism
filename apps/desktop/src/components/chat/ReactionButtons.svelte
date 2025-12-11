<script lang="ts">
  import type { Reaction, User } from "@apps/api-client";
  import { fly } from "svelte/transition";
  import { getApiClient, getMessage, useMutation, useQuery } from "@/lib/api.svelte";

  interface Props {
    messageId: string;
  }

  let { messageId }: Props = $props();

  const api = getApiClient();

  const reactions = useQuery<Reaction[]>(async () => {
    const response = await getMessage(api, messageId).reactions.get();
    if (response.error) {
      throw new Error(
        typeof response.error.value === "string"
          ? response.error.value
          : JSON.stringify(response.error.value),
      );
    }
    if (!response.data) {
      throw new Error("No reaction data returned");
    }
    return response.data;
  });

  const me = useQuery<User>(async () => {
    const response = await api.users.me.get();
    if (response.error) {
      throw new Error(
        typeof response.error.value === "string"
          ? response.error.value
          : JSON.stringify(response.error.value),
      );
    }
    if (!response.data) {
      throw new Error("No user data returned");
    }
    return response.data;
  });

  const addReaction = useMutation(
    async ({ messageId: mid, emoji }: { messageId: string; emoji: string }) => {
      const response = await getMessage(api, mid).reactions.post({
        emoji,
      });
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value),
        );
      }
      return response.data;
    },
  );
  const removeReaction = useMutation(
    async ({ messageId: mid, emoji }: { messageId: string; emoji: string }) => {
      const messageRoute = getMessage(api, mid);
      const response = await messageRoute.reactions[emoji].delete();
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value),
        );
      }
      return response.data;
    },
  );

  const reactionsByEmoji = $derived.by(() => {
    const counts = new Map<string, { count: number; me: boolean }>();
    if (!reactions.data) {
      return counts;
    }
    for (const r of reactions.data) {
      counts.set(r.emoji, {
        count: (counts.get(r.emoji)?.count ?? 0) + 1,
        me: counts.get(r.emoji)?.me || r.userId === me.data?.id,
      });
    }
    return counts;
  });

  function handleReactionClick(emoji: string, amIin: boolean) {
    if (!me.data) return;

    if (amIin) {
      removeReaction.run({ messageId, emoji });
    } else {
      addReaction.run({ messageId, emoji });
    }
  }
</script>

<div class="flex gap-1">
  {#each [...reactionsByEmoji.entries()] as [emoji, detail]}
    {@const amIin = detail.me}
    {@const count = detail.count}
    <div in:fly={{ y: -5, duration: 150 }}>
      <button
        class="btn btn-xs flex w-12 justify-between"
        class:btn-primary={amIin}
        onclick={() => handleReactionClick(emoji, amIin)}
      >
        {emoji}
        <span class="text-xs">{count}</span>
      </button>
    </div>
  {/each}
</div>

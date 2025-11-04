<script lang="ts">
  import { api, type Id } from "@apps/convex";
  import { useQuery } from "convex-svelte";
  import { fly } from "svelte/transition";
  import { useMutation } from "@/lib/useMutation.svelte.ts";

  interface Props {
    messageId: Id<"messages">;
  }

  let { messageId }: Props = $props();

  const reactions = useQuery(api.messages.getReactions, () => ({
    messageId,
  }));

  const me = useQuery(api.users.me, {});

  const addReaction = useMutation(api.messages.addReaction);
  const removeReaction = useMutation(api.messages.removeReaction);

  const reactionsByEmoji = $derived.by(() => {
    const counts = new Map<string, { count: number; me: boolean }>();
    if (!reactions.data) {
      return counts;
    }
    for (const r of reactions.data) {
      counts.set(r.emoji, {
        count: (counts.get(r.emoji)?.count ?? 0) + 1,
        me: counts.get(r.emoji)?.me || r.userId === me.data?._id,
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

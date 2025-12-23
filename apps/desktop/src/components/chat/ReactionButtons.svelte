<script lang="ts">
  import type { Reaction, User } from "@apps/api-client";
  import { fly } from "svelte/transition";
  import {
    getApiClient,
    getMessage,
    unwrapResponse,
    useMutation,
    useQuery,
  } from "@/lib/api.svelte";
  import { useWebSocket } from "@/lib/websocket";

  interface Props {
    messageId: string;
  }

  let { messageId }: Props = $props();

  const api = getApiClient();

  const reactions = useQuery<Reaction[]>(async () => {
    const response = await getMessage(api, messageId).reactions.get();
    return unwrapResponse(response);
  });

  const me = useQuery<User>(async () => {
    const response = await api.users.me.get();
    return unwrapResponse(response);
  });

  // Local state for real-time updates
  let reactionsData = $state<Reaction[]>([]);

  $effect(() => {
    if (reactions.data) {
      reactionsData = reactions.data;
    }
  });

  // WebSocket subscriptions (auto-cleanup via $effect)
  useWebSocket("reaction:added", (event) => {
    if (event.messageId === messageId) {
      const newReaction = event.reaction as Reaction;
      if (!reactionsData.some((r) => r.id === newReaction.id)) {
        reactionsData = [...reactionsData, newReaction];
      }
    }
  });

  useWebSocket("reaction:removed", (event) => {
    if (event.messageId === messageId) {
      reactionsData = reactionsData.filter(
        (r) => !(r.emoji === event.emoji && r.userId === event.userId),
      );
    }
  });

  const addReaction = useMutation(
    async ({ messageId: mid, emoji }: { messageId: string; emoji: string }) => {
      const response = await getMessage(api, mid).reactions.post({
        emoji,
      });
      return unwrapResponse(response);
    },
  );
  const removeReaction = useMutation(
    async ({ messageId: mid, emoji }: { messageId: string; emoji: string }) => {
      const messageRoute = getMessage(api, mid);
      const emojiRoute = messageRoute.reactions[emoji];
      if (!emojiRoute) {
        throw new Error(`Reaction route for ${emoji} not found`);
      }
      const response = await emojiRoute.delete();
      return unwrapResponse(response);
    },
  );

  const reactionsByEmoji = $derived.by(() => {
    const counts = new Map<string, { count: number; me: boolean }>();
    for (const r of reactionsData) {
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

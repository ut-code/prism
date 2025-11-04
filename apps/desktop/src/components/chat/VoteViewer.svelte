<script lang="ts">
  import { api, type Id } from "@apps/convex";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { proxify } from "@/lib/proxify.svelte";

  const { voteId }: { voteId: Id<"votes"> } = $props();

  const vote = useQuery(api.vote.getVote, () => ({ id: voteId }));
  const me = useQuery(api.users.me, () => ({}));

  const convex = useConvexClient();

  const { numbersOfVotersPerOption } = $derived(calculateVotes());
  const { isResultVisible } = $derived(myVotes());
  let { selectedOptions } = $derived(proxify(myVotes()));

  interface CalculateVotesReturn {
    numbersOfVotersPerOption: number[];
  }
  interface MyVotesReturn {
    isResultVisible: boolean;
    selectedOptions: number[];
  }

  function myVotes(): MyVotesReturn {
    let isResultVisible = false;
    let selectedOptions: number[] = [];
    if (!vote.data) {
      return {
        selectedOptions,
        isResultVisible,
      };
    }
    if (me.data) {
      for (const voter of vote.data.voters) {
        if (voter.userId === me.data._id) {
          selectedOptions = voter.votedOptions;
          isResultVisible = true;
        }
      }
    }
    return {
      isResultVisible: false,
      selectedOptions: [],
    };
  }
  function calculateVotes(): CalculateVotesReturn {
    if (!vote.data) {
      return {
        numbersOfVotersPerOption: [],
      };
    }
    const numbersOfVotersPerOption: number[] = [];
    for (let i = 0; i < vote.data.voteOptions.length; i++) {
      let num = 0;
      for (const voter of vote.data.voters) {
        if (voter.votedOptions.includes(i)) {
          num++;
        }
      }
      numbersOfVotersPerOption.push(num);
    }
    numbersOfVotersPerOption;

    return {
      numbersOfVotersPerOption,
    };
  }

  function clickableStatus(i: number): "selected" | "can select" | "capped" {
    if (hasInSelectedOptions(i)) return "selected";
    if (vote.data && selectedOptions.length < vote.data.maxVotes)
      return "can select";
    return "capped";
  }
  function toggleSelectionOption(i: number) {
    if (selectedOptions.includes(i)) {
      removeFromSelectedOptions(i);
    } else {
      addToSelectedOptions(i);
    }
  }
  function hasInSelectedOptions(i: number) {
    return selectedOptions.includes(i);
  }
  function removeFromSelectedOptions(i: number) {
    selectedOptions = selectedOptions.filter((op) => op !== i);
  }
  function addToSelectedOptions(i: number) {
    if (vote.data && selectedOptions.length < vote.data.maxVotes) {
      selectedOptions.push(i);
    }
  }
</script>

{#if vote.data}
  <div class="card bg-base-200 rounded p-2 shadow">
    <h2 class="text-primary m-1 font-mono text-4xl">投票：</h2>
    <h1 class="m-1 font-mono text-5xl">{vote.data?.title}</h1>
    <p class="text-secondary m-1 font-mono">
      一人の最大投票数：{vote.data?.maxVotes}票
    </p>
    {#each vote.data?.voteOptions as option, i}
      {@const status = clickableStatus(i)}
      <div class="flex">
        <p class="m-1 text-xl">
          {#if isResultVisible && numbersOfVotersPerOption[i]}
            {option}: {numbersOfVotersPerOption[i]}人
          {:else}
            {option}
          {/if}
        </p>
        <button
          class={[
            "btn {selectedOptions.includes(i) m-1 ml-auto",
            status === "can select" && "btn-primary",
            status === "selected" && "btn-error",
          ]}
          disabled={status === "capped"}
          onclick={() => {
            toggleSelectionOption(i);
          }}
        >
          {hasInSelectedOptions(i) ? "解除" : "選択"}
        </button>
      </div>
    {/each}
    <button
      class="btn btn-primary w-16"
      onclick={async () => {
        if (me.data) {
          await convex.mutation(api.vote.vote, {
            voteId: voteId,
            userId: me.data._id as Id<"users">,
            votedOptions: selectedOptions,
          });
        }
      }}
    >
      投票
    </button>
  </div>
{:else}{/if}

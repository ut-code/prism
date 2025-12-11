<script lang="ts">
  import type { User, Vote } from "@apps/api-client";
  import { getApiClient, getVote, useQuery } from "@/lib/api.svelte";
  import { proxify } from "@/lib/proxify.svelte";

  const { voteId }: { voteId: string } = $props();

  const api = getApiClient();
  const vote = useQuery<Vote>(async () => {
    const response = await getVote(api, voteId).get();
    if (response.error) {
      throw new Error(
        typeof response.error.value === "string"
          ? response.error.value
          : JSON.stringify(response.error.value),
      );
    }
    if (!response.data) {
      throw new Error("No vote data returned");
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
        if (voter.userId === me.data.id) {
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
          const voteRoute = getVote(api, voteId);
          if (voteRoute.cast) {
            const response = await voteRoute.cast.post({
              votedOptions: selectedOptions,
            });
            if (response.error) {
              console.error("Failed to cast vote:", response.error);
            }
          }
        }
      }}
    >
      投票
    </button>
  </div>
{:else}{/if}

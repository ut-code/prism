<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { proxify } from "~/lib/proxify.svelte";

  const { voteId }: { voteId: Id<"votes"> } = $props();

  const vote = useQuery(api.vote.getVote, () => ({ id: voteId }));
  const me = useQuery(api.users.me, () => ({}));

  const convex = useConvexClient();

  const { numbersOfVotersPerOption } = $derived(calculateVotes());
  const { isResultVisible } = $derived(myVotes());
  let { selectedOptions } = $derived(proxify(myVotes()));

  let numberOfAllVotes = $state(0);

  let numberOfVotesOfMostVotedOption = $state(0);

  let voteShareOfMostVotedOption = $state(0.0);

  let numbersOfVotersPerOption: number[] = $state([]);

  let selectedOptions: number[] = $state([]);

  if (vote.data) {
    let tempNumbersOfVotersPerOption: number[] = [];
    let tempNumberOfAllVotes = 0;
    let max = 0;
    for (let i = 0; i < vote.data.voteOptions.length; i++) {
      let num = 0;
      for (let j = 0; j < vote.data.voters.length; j++) {
        if (vote.data.voters[j].votedOptions.includes(i)) {
          num++;
        }   
      }
      if(num > max) max = num;
      tempNumberOfAllVotes += num;
      tempNumbersOfVotersPerOption.push(num);
    }
    numbersOfVotersPerOption = tempNumbersOfVotersPerOption;
    numberOfAllVotes = tempNumberOfAllVotes;
    voteShareOfMostVotedOption = tempNumberOfAllVotes? (max / tempNumberOfAllVotes) : 0;
    numberOfVotesOfMostVotedOption = max;

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

  $effect(() => {
    if (vote.data) {
      let tempNumbersOfVotersPerOption: number[] = [];
      let tempNumberOfAllVotes = 0;
      let max = 0;
      for (let i = 0; i < vote.data.voteOptions.length; i++) {
        let num = 0;
        for (let j = 0; j < vote.data.voters.length; j++) {
          if (vote.data.voters[j].votedOptions.includes(i)) {
            num++;
          }
          
        }
        if(num > max) max = num;
        tempNumberOfAllVotes += num;
        tempNumbersOfVotersPerOption.push(num);
      }
      numbersOfVotersPerOption = tempNumbersOfVotersPerOption;
      numberOfAllVotes = tempNumberOfAllVotes;
      voteShareOfMostVotedOption = tempNumberOfAllVotes? (max / tempNumberOfAllVotes) : 0;
      numberOfVotesOfMostVotedOption = max;
      if (me.data) {
        for (let i = 0; i < vote.data.voters.length; i++) {
          if (vote.data.voters[i].userId === me.data._id) {
            selectedOptions = vote.data.voters[i].votedOptions;
            isResultVisible = true;
          }
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

<div class="card bg-base-200 rounded p-2 shadow">
  <h2 class="text-primary m-1 font-mono text-4xl">投票：</h2>
  <h1 class="m-1 font-mono text-5xl">{vote.data?.title}</h1>
  <p class="text-secondary m-1 font-mono">
    一人の最大投票数：{vote.data?.maxVotes}票
  </p>
  {#each vote.data?.voteOptions as option, i}
    <div class="flex">
      <div class="relative w-full mr-3">
        <div class="transition transition-all rounded absolute mt-2 h-[28px] z-0 {(numbersOfVotersPerOption[i] === numberOfVotesOfMostVotedOption) ? "bg-orange-500" : "bg-blue-500"}"
          style={
            "width:" + ((numbersOfVotersPerOption[i] && numberOfAllVotes && voteShareOfMostVotedOption) ? (numbersOfVotersPerOption[i] / numberOfAllVotes / voteShareOfMostVotedOption * 100) : 0) + "%;"
          }></div>
        <p class="relative mt-2 ml-1 text-xl">
          {option}{isResultVisible
            ? "：" + numbersOfVotersPerOption[i] + "人"
            : ""}
        </p>
      </div>
      
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
    }}>投票</button
  >
</div>


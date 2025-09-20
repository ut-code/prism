<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useConvexClient, useQuery } from "convex-svelte";

  const { voteId }: { voteId: Id<"votes"> } = $props();

  const vote = useQuery(api.vote.getVote, () => ({ id: voteId }));
  const me = useQuery(api.users.me, () => ({}));

  const convex = useConvexClient();

  let isResultVisible = $state(false);

  let numbersOfVotersPerOption = $state<Array<number>>(Array<number>());

  let selectedOptions = $state<Array<number>>([]);

  if (vote.data) {
    let tempNumbersOfVotersPerOption = Array<number>();
    for (let i = 0; i < vote.data.voteOptions.length; i++) {
      let num = 0;
      for (let j = 0; j < vote.data.voters.length; j++) {
        if (vote.data.voters[j].votedOptions.includes(i)) {
          num++;
        }
      }
      tempNumbersOfVotersPerOption.push(num);
    }
    numbersOfVotersPerOption = tempNumbersOfVotersPerOption;

    if (me.data) {
      for (let i = 0; i < vote.data.voters.length; i++) {
        if (vote.data.voters[i].userId === me.data._id) {
          selectedOptions = vote.data.voters[i].votedOptions;
          isResultVisible = true;
        }
      }
    }
  }

  $effect(() => {
    if (vote.data) {
      let tempNumbersOfVotersPerOption = Array<number>();
      for (let i = 0; i < vote.data.voteOptions.length; i++) {
        let num = 0;
        for (let j = 0; j < vote.data.voters.length; j++) {
          if (vote.data.voters[j].votedOptions.includes(i)) {
            num++;
          }
        }
        tempNumbersOfVotersPerOption.push(num);
      }
      numbersOfVotersPerOption = tempNumbersOfVotersPerOption;
      if (me.data) {
        for (let i = 0; i < vote.data.voters.length; i++) {
          if (vote.data.voters[i].userId === me.data._id) {
            selectedOptions = vote.data.voters[i].votedOptions;
            isResultVisible = true;
          }
        }
      }
    }
  });
</script>

<div class="card bg-base-200 rounded p-2 shadow">
  <h2 class="text-primary m-1 font-mono text-4xl">投票：</h2>
  <h1 class="m-1 font-mono text-5xl">{vote.data?.title}</h1>
  <p class="text-secondary m-1 font-mono">
    一人の最大投票数：{vote.data?.maxVotes}票
  </p>
  {#each vote.data?.voteOptions as option, i}
    <div class="flex">
      <p class="m-1 text-xl">
        {option}{isResultVisible
          ? "：" + numbersOfVotersPerOption[i] + "人"
          : ""}
      </p>
      <button
        class="btn m-1 ml-auto {selectedOptions.includes(i)
          ? 'btn-secondary'
          : 'btn-primary'}"
        onclick={() => {
          if (selectedOptions.includes(i)) {
            selectedOptions = selectedOptions.filter((op) => op !== i);
          } else {
            if (vote.data && selectedOptions.length < vote.data.maxVotes) {
              selectedOptions.push(i);
            }
          }
        }}>{selectedOptions.includes(i) ? "削除" : "選択"}</button
      >
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

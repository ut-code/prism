<script lang="ts">
  type Vote = {
    title: string;
    maxVotes: number;
    voteOptions: Array<string>;
    voters: Array<{
      userId: string;
      votedOptions: Array<number>;
    }>;
  };
  interface Props {
    vote: Vote;
  }
  let { vote = $bindable() }: Props = $props();

  let newOption = $state("");
</script>

<div class="flex items-center gap-2">
  <p class="text-sm opacity-80">Poll title:</p>
  <input
    type="text"
    class="input input-sm input-bordered w-128"
    bind:value={vote.title}
  />
</div>

<div class="flex items-center gap-2">
  <p class="text-sm opacity-80">Max votes per person:</p>
  <input
    type="number"
    class="input input-sm input-bordered w-32"
    bind:value={vote.maxVotes}
    onblur={() => {
      vote.maxVotes = vote.maxVotes ?? 0;
    }}
  />
</div>
<div class="max-h-32 space-y-2 overflow-auto">
  {#each vote.voteOptions as option, i}
    <div class="flex items-center gap-2">
      <p class="text-sm">{i}: {option}</p>
      <button
        class="btn btn-ghost btn-xs"
        onclick={() => {
          vote.voteOptions.splice(i, 1);
        }}>Remove</button
      >
    </div>
  {/each}
</div>

<div class="flex items-center gap-2">
  <p class="text-sm opacity-80">Add option:</p>
  <input
    type="text"
    class="input input-sm input-bordered w-128"
    bind:value={newOption}
  />
  <button
    class="btn btn-primary btn-sm"
    onclick={() => {
      if (newOption.trim()) {
        vote.voteOptions.push(newOption);
        newOption = "";
      }
    }}>Add</button
  >
</div>

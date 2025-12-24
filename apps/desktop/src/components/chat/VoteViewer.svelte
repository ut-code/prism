<script lang="ts">
  import { VoteViewerController } from "./VoteViewer.svelte.ts";

  const { voteId }: { voteId: string } = $props();

  const controller = new VoteViewerController(() => ({ voteId }));
</script>

{#if controller.vote.isLoading}
  <div class="text-sm opacity-60">Loading poll...</div>
{:else if controller.vote.error}
  <div class="text-error text-sm">Failed to load poll</div>
{:else if controller.vote.data}
  <div class="card bg-base-200 space-y-4 rounded p-4 shadow">
    <h2 class="text-primary m-1 font-mono text-4xl">Poll:</h2>
    <h1 class="font-mono text-5xl">{controller.vote.data.title}</h1>
    <p class="text-secondary font-mono text-sm opacity-80">
      Max votes per person: {controller.vote.data.maxVotes}
    </p>
    <div class="space-y-2">
      {#each controller.vote.data.voteOptions as option, i}
        {@const status = controller.clickableStatus(i)}
        <div class="flex items-center gap-2">
          <p class="flex-1 text-xl">
            {#if controller.isResultVisible && controller.numbersOfVotersPerOption[i]}
              {option}: {controller.numbersOfVotersPerOption[i]} votes
            {:else}
              {option}
            {/if}
          </p>
          <button
            class={[
              "btn btn-sm",
              status === "can select" && "btn-primary",
              status === "selected" && "btn-error",
            ]}
            disabled={status === "capped" || controller.isCasting}
            onclick={() => {
              controller.toggleSelectionOption(i);
            }}
          >
            {controller.hasInSelectedOptions(i) ? "Deselect" : "Select"}
          </button>
        </div>
      {/each}
    </div>
    <button
      class="btn btn-primary btn-sm"
      disabled={controller.isCasting}
      onclick={() => controller.castVote()}
    >
      {controller.isCasting ? "Voting..." : "Vote"}
    </button>
  </div>
{/if}

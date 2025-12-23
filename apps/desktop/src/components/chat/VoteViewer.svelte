<script lang="ts">
  import { VoteViewerController } from "./VoteViewer.svelte.ts";

  const { voteId }: { voteId: string } = $props();

  const controller = new VoteViewerController(() => ({ voteId }));
</script>

{#if controller.vote.data}
  <div class="card bg-base-200 rounded p-2 shadow">
    <h2 class="text-primary m-1 font-mono text-4xl">投票：</h2>
    <h1 class="m-1 font-mono text-5xl">{controller.vote.data.title}</h1>
    <p class="text-secondary m-1 font-mono">
      一人の最大投票数：{controller.vote.data.maxVotes}票
    </p>
    {#each controller.vote.data.voteOptions as option, i}
      {@const status = controller.clickableStatus(i)}
      <div class="flex">
        <p class="m-1 text-xl">
          {#if controller.isResultVisible && controller.numbersOfVotersPerOption[i]}
            {option}: {controller.numbersOfVotersPerOption[i]}人
          {:else}
            {option}
          {/if}
        </p>
        <button
          class={[
            "btn m-1 ml-auto",
            status === "can select" && "btn-primary",
            status === "selected" && "btn-error",
          ]}
          disabled={status === "capped"}
          onclick={() => {
            controller.toggleSelectionOption(i);
          }}
        >
          {controller.hasInSelectedOptions(i) ? "解除" : "選択"}
        </button>
      </div>
    {/each}
    <button class="btn btn-primary w-16" onclick={() => controller.castVote()}>
      投票
    </button>
  </div>
{/if}

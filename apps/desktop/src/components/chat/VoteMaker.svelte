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

<div class="m-1 flex items-center">
  <p class="text">投票のタイトル：</p>
  <input
    type="text"
    class="input input-sm input-bordered ml-2 w-128"
    bind:value={vote.title}
  />
</div>

<div class="m-1 flex items-center">
  <p class="text">一人が投票できる最大数：</p>
  <input
    type="number"
    class="input input-sm input-bordered ml-2 w-32"
    bind:value={vote.maxVotes}
    onblur={() => {
      vote.maxVotes = vote.maxVotes ?? 0;
    }}
  />
</div>
<div class="max-h-32 overflow-auto">
  {#each vote.voteOptions as option, i}
    <div class="m-1 flex items-center">
      <p class="text">{i}：{option}</p>
      <button
        class="btn btn-secondary ml-2"
        onclick={() => {
          vote.voteOptions.splice(i, 1);
        }}>削除</button
      >
    </div>
  {/each}
</div>

<div class="m-1 flex items-center">
  <p class="text">選択肢を追加：</p>
  <input
    type="text"
    class="input input-sm input-bordered ml-2 w-128"
    bind:value={newOption}
  />
  <button
    class="btn btn-primary ml-2"
    onclick={() => {
      if (newOption.trim()) {
        vote.voteOptions.push(newOption);
        newOption = "";
      }
    }}>追加</button
  >
</div>

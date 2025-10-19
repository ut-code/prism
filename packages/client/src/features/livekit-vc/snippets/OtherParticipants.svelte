<script lang="ts">
  import Mount from "~/lib/svelte/Mount.svelte";

  interface Props {
    mediaEls: Map<string, HTMLMediaElement>;
  }

  let { mediaEls }: Props = $props();
</script>

<!-- Other Participants' Video Streams -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h3 class="card-title text-2xl">👥 他の参加者</h3>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each Array.from(mediaEls.entries()) as [key, el]}
        {#if !key.startsWith("local-")}
          <div class="card bg-base-200 shadow-sm">
            <div class="card-body p-4">
              <div class="mb-3 flex items-center gap-2">
                <div class="badge badge-success gap-2">
                  <div class="bg-success h-2 w-2 rounded-full"></div>
                  {key}
                </div>
              </div>
              <div
                class="aspect-video overflow-hidden rounded-lg bg-black shadow-inner"
              >
                <Mount element={el} />
              </div>
            </div>
          </div>
        {/if}
      {/each}
      {#if Array.from(mediaEls.entries()).filter(([key]) => !key.startsWith("local-")).length === 0}
        <div class="card bg-base-200 col-span-full shadow-sm">
          <div class="card-body py-12 text-center">
            <div class="mb-4 text-6xl">👥</div>
            <div class="text-lg font-medium">まだ他の参加者はいません</div>
            <div class="mt-2 text-sm opacity-70">
              他の人が同じルームに参加すると、ここに表示されます
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

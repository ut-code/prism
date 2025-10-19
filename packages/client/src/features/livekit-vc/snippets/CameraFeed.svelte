<script lang="ts">
  import Mount from "~/lib/svelte/Mount.svelte";
  import type { LocalParticipantState } from "../types.ts";

  interface Props {
    localParticipantState: LocalParticipantState;
    mediaEls: Map<string, HTMLMediaElement>;
  }

  let { localParticipantState, mediaEls }: Props = $props();
</script>

<!-- Your Camera Feed -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h3 class="card-title text-2xl">📹 あなたのカメラ</h3>

    <div class="card bg-base-200 shadow-sm">
      {#if localParticipantState.isCameraEnabled}
        {#each Array.from(mediaEls.entries()) as [key, el]}
          {#if key.startsWith("local-video") || key === "local-video"}
            <div class="relative">
              <div class="mb-3 flex items-center gap-2">
                <div class="badge badge-success gap-2">
                  <div class="bg-success h-2 w-2 rounded-full"></div>
                  カメラがオンです
                </div>
              </div>
              <div
                class="aspect-video w-full max-w-lg overflow-hidden rounded-lg bg-black shadow-lg"
              >
                <Mount element={el} />
              </div>
            </div>
          {/if}
        {/each}
        {#if !Array.from(mediaEls.entries()).some(([key]) => key.startsWith("local-video") || key === "local-video")}
          <div
            class="flex aspect-video w-full max-w-lg items-center justify-center rounded-lg bg-gray-100 shadow-inner"
          >
            <div class="text-center text-gray-500">
              <div class="mb-3 text-6xl">📹</div>
              <div class="text-lg font-medium">
                カメラがオンですが、映像が表示されていません
              </div>
              <div class="mt-2 text-sm">カメラの権限を確認してください</div>
            </div>
          </div>
        {/if}
      {:else}
        <div class="card-body">
          <div
            class="bg-base-300 flex aspect-video w-full max-w-lg items-center justify-center rounded-lg"
          >
            <div class="text-center">
              <div class="mb-3 text-6xl">📷</div>
              <div class="text-lg font-medium">カメラがオフです</div>
              <div class="mt-2 text-sm">
                「カメラオン」ボタンを押してカメラを開始してください
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

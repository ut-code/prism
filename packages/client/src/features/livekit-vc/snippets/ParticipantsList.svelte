<script lang="ts">
  import type { Room } from "livekit-client";
  import type { Participant } from "../types.ts";

  interface Props {
    allParticipants: Participant[];
    room: Room;
  }

  let { allParticipants, room }: Props = $props();
</script>

<!-- All Participants List -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h3 class="card-title text-2xl">👥 参加者一覧</h3>

    <div class="grid gap-3">
      {#each allParticipants as participant}
        <div class="card bg-base-200 shadow-sm">
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div
                    class="bg-neutral text-neutral-content w-12 rounded-full"
                  >
                    <span class="text-xl">
                      {#if participant === room.localParticipant}
                        👤
                      {:else}
                        👥
                      {/if}
                    </span>
                  </div>
                </div>
                <div>
                  <div class="font-semibold">
                    {participant.identity || participant.name || "Unknown"}
                    {#if participant === room.localParticipant}
                      <div class="badge badge-primary badge-sm">あなた</div>
                    {/if}
                  </div>
                  <div class="flex items-center gap-4 text-sm">
                    <div
                      class="badge {participant.isMicrophoneEnabled
                        ? 'badge-success'
                        : 'badge-error'} gap-1"
                    >
                      <div
                        class="h-2 w-2 rounded-full {participant.isMicrophoneEnabled
                          ? 'bg-success'
                          : 'bg-error'}"
                      ></div>
                      マイク: {participant.isMicrophoneEnabled ? "ON" : "OFF"}
                    </div>
                    <div
                      class="badge {participant.isCameraEnabled
                        ? 'badge-success'
                        : 'badge-error'} gap-1"
                    >
                      <div
                        class="h-2 w-2 rounded-full {participant.isCameraEnabled
                          ? 'bg-success'
                          : 'bg-error'}"
                      ></div>
                      カメラ: {participant.isCameraEnabled ? "ON" : "OFF"}
                    </div>
                  </div>
                </div>
              </div>
              <div class="badge badge-outline">
                {participant.isActive ? "アクティブ" : "非アクティブ"}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

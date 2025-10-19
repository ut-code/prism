<script lang="ts">
  import type { RemoteParticipant, Room } from "livekit-client";
  import { env } from "~/lib/env";
  import type { LocalParticipantState } from "../types.ts";

  interface Props {
    room: Room;
    localParticipantState: LocalParticipantState;
    remoteParticipants: RemoteParticipant[];
    mediaEls: Map<string, HTMLMediaElement>;
  }

  let { room, localParticipantState, remoteParticipants, mediaEls }: Props =
    $props();
</script>

<!-- Debug Info -->
<div class="card bg-base-100 mt-6 shadow-xl">
  <div class="card-body">
    <h3 class="card-title text-lg">🔧 Debug Info</h3>
    <div class="mockup-code">
      Room Info: {JSON.stringify(
        {
          name: room.name,
          state: room.state,
          numParticipants: room.numParticipants,
          serverUrl: env.PUBLIC_LIVEKIT_WSURL,
          isConnected: room.state === "connected",
        },
        null,
        2,
      )}

      Local Participant: {JSON.stringify(
        {
          identity: localParticipantState.identity,
          name: localParticipantState.name,
          isActive: localParticipantState.isActive,
          isMicrophoneEnabled: localParticipantState.isMicrophoneEnabled,
          isCameraEnabled: localParticipantState.isCameraEnabled,
        },
        null,
        2,
      )}

      Remote Participants: {JSON.stringify(
        remoteParticipants.map((p) => ({
          identity: p.identity,
          name: p.name,
          isActive: p.isActive,
          isMicrophoneEnabled: p.isMicrophoneEnabled,
          isCameraEnabled: p.isCameraEnabled,
        })),
        null,
        2,
      )}

      Media Elements: {JSON.stringify(Array.from(mediaEls.keys()), null, 2)}
    </div>
  </div>
</div>

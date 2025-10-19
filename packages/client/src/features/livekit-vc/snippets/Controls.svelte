<script lang="ts">
  import iCamera from "../icons/camera.svg";
  import iCameraDisabled from "../icons/camera-disabled.svg";
  import iMicrophone from "../icons/microphone.svg";
  import iMicrophoneDisabled from "../icons/microphone-disabled.svg";
  import iPhone from "../icons/phone.svg";
  import type { LocalParticipantState } from "../types.ts";

  interface Props {
    localParticipantState: LocalParticipantState;
    toggleMicrophone: () => void;
    toggleCamera: () => void;
    disconnect: () => void;
  }

  let {
    localParticipantState,
    toggleMicrophone,
    toggleCamera,
    disconnect,
  }: Props = $props();
</script>

<!-- Audio/Video Controls -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h3 class="card-title justify-center text-2xl">🎛️ 通話コントロール</h3>

    <!-- Main Control Buttons -->
    <div class="mb-6 flex justify-center gap-6">
      <!-- Microphone Button -->
      <button
        onclick={toggleMicrophone}
        class="btn btn-circle btn-lg {localParticipantState.isMicrophoneEnabled
          ? 'btn-error'
          : 'btn-outline'}"
        title={localParticipantState.isMicrophoneEnabled
          ? "ミュート"
          : "ミュート解除"}
      >
        {#if localParticipantState.isMicrophoneEnabled}
          <img src={iMicrophone} alt="マイクオン" />
        {:else}
          <img src={iMicrophoneDisabled} alt="マイクオフ" />
        {/if}
      </button>

      <!-- Camera Button -->
      <button
        onclick={toggleCamera}
        class="btn btn-circle btn-lg {localParticipantState.isCameraEnabled
          ? 'btn-error'
          : 'btn-outline'}"
        title={localParticipantState.isCameraEnabled
          ? "カメラオフ"
          : "カメラオン"}
      >
        {#if localParticipantState.isCameraEnabled}
          <img src={iCamera} alt="カメラオン" />
        {:else}
          <img src={iCameraDisabled} alt="カメラオフ" />
        {/if}
      </button>

      <!-- Leave Call Button -->
      <button
        onclick={disconnect}
        class="btn btn-circle btn-lg btn-error"
        title="通話終了"
      >
        <img src={iPhone} alt="通話終了" />
      </button>
    </div>

    <!-- Status Indicators -->
    <div class="flex justify-center gap-8">
      <div
        class="badge {localParticipantState.isMicrophoneEnabled
          ? 'badge-success'
          : 'badge-error'} gap-2"
      >
        <div
          class="h-2 w-2 rounded-full {localParticipantState.isMicrophoneEnabled
            ? 'bg-success'
            : 'bg-error'}"
        ></div>
        マイク: {localParticipantState.isMicrophoneEnabled ? "ON" : "OFF"}
      </div>
      <div
        class="badge {localParticipantState.isCameraEnabled
          ? 'badge-success'
          : 'badge-error'} gap-2"
      >
        <div
          class="h-2 w-2 rounded-full {localParticipantState.isCameraEnabled
            ? 'bg-success'
            : 'bg-error'}"
        ></div>
        カメラ: {localParticipantState.isCameraEnabled ? "ON" : "OFF"}
      </div>
    </div>
  </div>
</div>

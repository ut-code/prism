<script lang="ts">
  import CameraFeed from "../snippets/CameraFeed.svelte";
  import Controls from "../snippets/Controls.svelte";
  import DebugInfo from "../snippets/DebugInfo.svelte";
  import Header from "../snippets/Header.svelte";
  import OtherParticipants from "../snippets/OtherParticipants.svelte";
  import ParticipantsList from "../snippets/ParticipantsList.svelte";
  import RoomJoin from "../snippets/RoomJoin.svelte";
  import { VideoCallController } from "../VideoCallController.svelte.ts";

  const ctl = new VideoCallController();
</script>

<div class="container mx-auto max-w-6xl p-6">
  <Header connectionState={ctl.connectionState} />

  {#if !ctl.connectionState.connected}
    <!-- 未接続状態のUI -->
    <div class="py-16 text-center">
      <div class="mb-8">
        <div class="mb-6 text-8xl">📞</div>
        <h2 class="mb-4 text-3xl font-bold">ビデオ通話を開始</h2>
        <p class="text-base-content/70 mb-8 text-lg">
          トークンを入力して通話ルームに参加しましょう
        </p>
      </div>

      <RoomJoin
        connectionState={ctl.connectionState}
        joinRoom={(token) => ctl.joinRoom(token)}
        disconnect={() => ctl.disconnect()}
      />
    </div>
  {:else}
    <!-- 接続状態のUI -->
    <div class="grid gap-8">
      <!-- 上部: ルーム情報とコントロール -->
      <div class="grid gap-6 md:grid-cols-2">
        <RoomJoin
          connectionState={ctl.connectionState}
          joinRoom={(token) => ctl.joinRoom(token)}
          disconnect={() => ctl.disconnect()}
        />

        <Controls
          localParticipantState={ctl.localParticipantState}
          toggleMicrophone={() => ctl.toggleMicrophone()}
          toggleCamera={() => ctl.toggleCamera()}
          disconnect={() => ctl.disconnect()}
        />
      </div>

      <!-- 中部: カメラフィード -->
      <div class="grid gap-6 lg:grid-cols-2">
        <CameraFeed
          localParticipantState={ctl.localParticipantState}
          mediaEls={ctl.mediaEls}
        />

        <OtherParticipants mediaEls={ctl.mediaEls} />
      </div>

      <!-- 下部: 参加者一覧とデバッグ情報 -->
      <div class="grid gap-6">
        <ParticipantsList
          allParticipants={ctl.allParticipants}
          room={ctl.room}
        />

        <DebugInfo
          room={ctl.room}
          localParticipantState={ctl.localParticipantState}
          remoteParticipants={Array.from(ctl.remoteParticipants.values())}
          mediaEls={ctl.mediaEls}
        />
      </div>
    </div>
  {/if}
</div>

<script lang="ts">
  import type { ConnectionState } from "../types.ts";

  interface Props {
    connectionState: ConnectionState;
  }

  let { connectionState }: Props = $props();
</script>

<!-- Header -->
<div class="mb-8 text-center">
  <h1 class="mb-4 text-4xl font-bold">📹 ビデオ通話</h1>
  <div class="flex flex-wrap items-center justify-center gap-4 text-sm">
    <div
      class="badge {connectionState.connected
        ? 'badge-success'
        : 'badge-error'} gap-2"
    >
      <div
        class="h-2 w-2 rounded-full {connectionState.connected
          ? 'bg-success'
          : 'bg-error'}"
      ></div>
      {connectionState.connected ? "接続中" : "接続待機中"}
    </div>
    {#if connectionState.connected}
      <div class="badge badge-outline">ルーム: {connectionState.roomName}</div>
      <div class="badge badge-primary">
        参加者: {connectionState.participantCount}人
      </div>
    {:else}
      <div class="badge badge-outline">ルーム: 未接続</div>
      <div class="badge badge-primary">参加者: 0人</div>
    {/if}
  </div>
</div>

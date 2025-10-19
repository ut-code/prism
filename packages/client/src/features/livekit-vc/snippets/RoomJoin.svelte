<script lang="ts">
  import type { ConnectionState } from "../types.ts";

  interface Props {
    connectionState: ConnectionState;
    joinRoom: (token: string) => void;
    disconnect: () => void;
  }

  let { connectionState, joinRoom, disconnect }: Props = $props();

  let token = $state("");
</script>

<!-- Room Join Section -->
{#if !connectionState.connected}
  <div class="card bg-primary text-primary-content shadow-xl">
    <div class="card-body">
      <h3 class="card-title text-2xl">🏠 ルームに参加</h3>

      <div class="form-control mb-4">
        <input
          type="text"
          bind:value={token}
          placeholder="LiveKitアクセストークンを入力"
          class="input input-bordered w-full"
        />
        <div class="label">
          <span class="label-text-alt text-primary-content/70">
            💡 サーバーから取得したトークンを入力してください
          </span>
        </div>
      </div>

      <div class="form-control">
        <button
          onclick={() => joinRoom(token)}
          class="btn btn-secondary btn-lg w-full"
          disabled={!token.trim()}
        >
          📞 通話に参加する
        </button>
        <div class="label">
          <span class="label-text-alt">
            💡 トークンを入力してからボタンを押してください
          </span>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="card bg-success text-success-content shadow-xl">
    <div class="card-body">
      <h3 class="card-title text-2xl">✅ ルームに接続中</h3>
      <div class="form-control">
        <div class="mb-4 text-center">
          <div class="text-lg font-semibold">
            ルーム: {connectionState.roomName}
          </div>
          <div class="text-sm opacity-80">
            参加者: {connectionState.participantCount}人
          </div>
        </div>
        <button onclick={disconnect} class="btn btn-error btn-lg w-full">
          📞 通話を終了する
        </button>
        <div class="label">
          <span class="label-text-alt">
            💡 通話を終了するにはボタンを押してください
          </span>
        </div>
      </div>
    </div>
  </div>
{/if}

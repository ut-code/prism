<script lang="ts">
  import { type Id } from "@packages/convex";

  interface Props {
    selectedChannelId?: Id<"channels">;
  }

  let { selectedChannelId = $bindable(undefined) }: Props = $props();

  // This component is deprecated - use OrganizationChannelList instead

  async function createChannel() {
    const name = prompt("チャンネル名を入力してください:");
    if (name?.trim()) {
      // This component is deprecated - channels need organizationId
    }
  }
</script>

<div class="bg-base-200 flex h-full w-64 flex-col">
  <div class="border-base-300 border-b p-4">
    <h2 class="text-lg font-semibold">チャンネル</h2>
    <button class="btn btn-primary btn-sm mt-2 w-full" onclick={createChannel}>
      + 新しいチャンネル
    </button>
  </div>

  <div class="flex-1 overflow-y-auto">
    <div class="text-base-content/60 p-4 text-center">
      この機能は廃止されました。OrganizationChannelListを使用してください。
    </div>
  </div>
</div>

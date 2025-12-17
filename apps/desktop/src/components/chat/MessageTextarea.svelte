<script lang="ts">
  import Paperclip from "@lucide/svelte/icons/paperclip";

  interface Props {
    value: string;
    showFileSelector: boolean;
    showVoteMaker: boolean;
    onkeydown: (event: KeyboardEvent) => void;
    ontoggleFileUploader: () => void;
    ontoggleVoteMaker: () => void;
  }

  let {
    value = $bindable(),
    showFileSelector,
    showVoteMaker,
    onkeydown,
    ontoggleFileUploader,
    ontoggleVoteMaker,
  }: Props = $props();
</script>

<!--
  Textarea for message input with action buttons for attachments and votes.
  Supports keyboard shortcuts (Ctrl+Enter to send).
-->
<div class="flex-1 space-y-2">
  <textarea
    placeholder="メッセージを入力... (Ctrl+Enterで送信、Enterで改行)"
    class="textarea textarea-bordered w-full resize-none"
    rows="2"
    bind:value
    {onkeydown}
  ></textarea>

  <!-- Action buttons -->
  <div class="flex gap-2">
    <button
      class="btn btn-ghost btn-sm"
      onclick={ontoggleFileUploader}
      title="ファイルを添付"
      type="button"
    >
      <Paperclip class="size-4" />
      {showFileSelector ? "キャンセル" : "ファイル添付"}
    </button>
    <button
      class="btn btn-ghost btn-sm"
      onclick={ontoggleVoteMaker}
      title="投票を作成"
      type="button"
    >
      {showVoteMaker ? "キャンセル" : "投票を作成"}
    </button>
  </div>
</div>

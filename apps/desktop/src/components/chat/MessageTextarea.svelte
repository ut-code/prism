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
    placeholder="Type a message... (Ctrl+Enter to send, Enter for new line)"
    class="textarea textarea-bordered w-full resize-none"
    rows="2"
    bind:value
    {onkeydown}
    aria-label="Message input"
  ></textarea>

  <!-- Action buttons -->
  <div class="flex gap-2">
    <button
      class="btn btn-ghost btn-sm"
      onclick={ontoggleFileUploader}
      title="Attach file"
      type="button"
    >
      <Paperclip class="size-4" />
      {showFileSelector ? "Cancel" : "Attach File"}
    </button>
    <button
      class="btn btn-ghost btn-sm"
      onclick={ontoggleVoteMaker}
      title="Create poll"
      type="button"
    >
      {showVoteMaker ? "Cancel" : "Create Poll"}
    </button>
  </div>
</div>

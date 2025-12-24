<script lang="ts">
  import X from "@lucide/svelte/icons/x";
  import type { Message } from "@packages/api-client";
  import FileSelector from "@/features/files/upload/Selector.svelte";
  import EmojiButton from "./EmojiButton.svelte";
  import EmojiPalette from "./EmojiPalette.svelte";
  import FileAttachmentPreview from "./FileAttachmentPreview.svelte";
  import { MessageInputController } from "./MessageInputController.svelte.ts";
  import MessageTextarea from "./MessageTextarea.svelte";
  import SendButton from "./SendButton.svelte";
  import VoteMaker from "./VoteMaker.svelte";

  interface Props {
    organizationId: string;
    channelId: string;
    replyingTo: Message | null;
  }

  let { channelId, organizationId, replyingTo = $bindable() }: Props = $props();

  const controller = new MessageInputController(() => ({
    organizationId,
    channelId,
    replyingTo,
    onReplyingToChange: (value) => {
      replyingTo = value;
    },
  }));
</script>

<footer class="border-subtle bg-base-100 border-t">
  <!-- Reply banner -->
  {#if replyingTo}
    <div
      class="border-subtle bg-base-200/50 flex items-center gap-2 border-b px-4 py-3 text-sm"
    >
      <span class="text-muted opacity-60">Replying to:</span>
      <span class="text-primary font-medium">{replyingTo.author}</span>
      <span class="text-muted flex-1 truncate opacity-60"
        >{replyingTo.content}</span
      >
      <button
        class="btn btn-ghost btn-xs btn-square"
        onclick={() => (replyingTo = null)}
      >
        <X class="size-4" />
      </button>
    </div>
  {/if}

  <!-- File attachments preview -->
  {#if controller.attachedFiles.length > 0}
    <div class="border-subtle border-b px-4 py-2">
      <FileAttachmentPreview
        files={controller.attachedFiles}
        onremove={(index) => controller.removeFile(index)}
      />
    </div>
  {/if}

  <!-- File selector -->
  {#if controller.showFileSelector}
    <div class="border-subtle border-b p-4">
      <FileSelector
        {organizationId}
        bind:files={controller.attachedFiles}
        onselect={() => (controller.showFileSelector = false)}
      />
    </div>
  {/if}

  <!-- Vote maker -->
  {#if controller.showVoteMaker}
    <div class="border-subtle border-b p-4">
      <VoteMaker bind:vote={controller.vote} />
    </div>
  {/if}

  <!-- Input area -->
  <div class="flex items-end gap-2 p-4">
    <div class="flex-1">
      <MessageTextarea
        bind:value={controller.messageContent}
        showFileSelector={controller.showFileSelector}
        showVoteMaker={controller.showVoteMaker}
        onkeydown={(e) => controller.handleKeyPress(e)}
        ontoggleFileUploader={() => controller.toggleFileUploader()}
        ontoggleVoteMaker={() => controller.toggleVoteMaker()}
      />
    </div>

    <div class="flex items-center gap-2">
      <EmojiButton
        onclick={(e) => {
          e.stopPropagation();
          controller.toggleEmojiPalette();
        }}
      />
      <SendButton
        disabled={!controller.clickable}
        processing={controller.sendMessageMutation.processing}
        onclick={() => controller.sendMessage()}
      />
    </div>
  </div>

  <!-- Emoji palette -->
  {#if controller.showEmojiPalette}
    <div class="border-subtle border-t">
      <EmojiPalette
        onClose={() => (controller.showEmojiPalette = false)}
        onEmojiSelected={(emoji) => controller.addEmoji(emoji)}
      />
    </div>
  {/if}

  <!-- Error message -->
  {#if controller.sendMessageMutation.error}
    <div
      class="border-error/30 bg-error/10 text-error border-t px-4 py-2 text-sm"
    >
      {controller.sendMessageMutation.error}
    </div>
  {/if}
</footer>

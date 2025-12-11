<script lang="ts">
  import type { Message } from "@apps/api-client";
  import FileSelector from "@/features/files/upload/Selector.svelte";
  import EmojiButton from "./EmojiButton.svelte";
  import EmojiPalette from "./EmojiPalette.svelte";
  import FileAttachmentPreview from "./FileAttachmentPreview.svelte";
  import { MessageInputController } from "./MessageInputController.svelte.ts";
  import MessageTextarea from "./MessageTextarea.svelte";
  import ReplyBanner from "./ReplyBanner.svelte";
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

<!--
  Main message input component.
  Orchestrates reply banner, file attachments, vote maker, textarea, and send controls.
-->
<div class="border-base-300 bg-base-100 space-y-4 border-t p-4">
  {#if replyingTo}
    <ReplyBanner {replyingTo} onclose={() => (replyingTo = null)} />
  {/if}

  <FileAttachmentPreview
    files={controller.attachedFiles}
    onremove={(index) => controller.removeFile(index)}
  />

  {#if controller.showFileSelector}
    <FileSelector
      {organizationId}
      bind:files={controller.attachedFiles}
      onselect={() => {
        controller.showFileSelector = false;
      }}
    />
  {/if}

  {#if controller.showVoteMaker}
    <VoteMaker bind:vote={controller.vote} />
  {/if}

  <div class="flex gap-2">
    <MessageTextarea
      bind:value={controller.messageContent}
      showFileSelector={controller.showFileSelector}
      showVoteMaker={controller.showVoteMaker}
      onkeydown={(e) => controller.handleKeyPress(e)}
      ontoggleFileUploader={() => controller.toggleFileUploader()}
      ontoggleVoteMaker={() => controller.toggleVoteMaker()}
    />

    <SendButton
      disabled={!controller.clickable}
      processing={controller.sendMessageMutation.processing}
      onclick={() => controller.sendMessage()}
    />

    <EmojiButton
      onclick={(e) => {
        e.stopPropagation();
        controller.toggleEmojiPalette();
      }}
    />
  </div>

  {#if controller.showEmojiPalette}
    <EmojiPalette
      onClose={() => (controller.showEmojiPalette = false)}
      onEmojiSelected={(emoji) => controller.addEmoji(emoji)}
    />
  {/if}

  {#if controller.sendMessageMutation.error}
    <div class="alert alert-error text-sm">
      {controller.sendMessageMutation.error}
    </div>
  {/if}
</div>

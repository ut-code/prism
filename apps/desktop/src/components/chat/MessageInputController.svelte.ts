import type { Message } from "@packages/api-client";
import { FileUploader } from "@/features/files/upload/uploader.svelte";
import { MessageInputApi } from "./messageInputApi.svelte.ts";
import {
  canSendMessage,
  createEmptyVote,
  isVoteValid,
  type Vote,
} from "./messageInputUtils.ts";

interface ControllerProps {
  organizationId: string;
  channelId: string;
  replyingTo: Message | null;
  onReplyingToChange: (value: Message | null) => void;
}

/**
 * Controller for MessageInput component.
 * Manages UI state and coordinates message sending operations.
 */
export class MessageInputController {
  private api = new MessageInputApi();

  // Reactive props
  organizationId: string;
  channelId: string;
  replyingTo: Message | null;
  onReplyingToChange: (value: Message | null) => void;

  // UI state
  messageContent = $state("");
  showEmojiPalette = $state(false);
  showFileSelector = $state(false);
  attachedFiles = $state<File[]>([]);
  showVoteMaker = $state(false);
  vote = $state<Vote>(createEmptyVote());

  uploader: FileUploader;

  constructor(props: () => ControllerProps) {
    this.organizationId = $derived(props().organizationId);
    this.channelId = $derived(props().channelId);
    this.replyingTo = $derived(props().replyingTo);
    this.onReplyingToChange = $derived(props().onReplyingToChange);

    this.uploader = new FileUploader(() => ({
      organizationId: this.organizationId,
    }));
  }

  get sendMessageMutation() {
    return this.api.sendMessageMutation;
  }

  get identity() {
    return this.api.identity;
  }

  /**
   * Determines if the send button should be clickable.
   */
  get clickable(): boolean {
    return canSendMessage(
      this.messageContent,
      this.attachedFiles.length,
      this.vote,
      this.api.sendMessageMutation.processing,
      !!this.api.identity.data,
    );
  }

  /**
   * Sends the message with attachments and vote if applicable.
   */
  async sendMessage() {
    if (!this.clickable || !this.api.identity.data) return;

    const attachments = (await this.uploader.uploadAll(this.attachedFiles)).map(
      (it) => it.id,
    );

    const voteId = isVoteValid(this.vote)
      ? await this.api.createVote(this.vote)
      : undefined;

    await this.api.sendMessageMutation.run({
      channelId: this.channelId,
      content: this.messageContent.trim() || "",
      parentId: this.replyingTo?.id ?? undefined,
      attachments,
      voteId,
    });

    this.resetForm();
  }

  /**
   * Resets the form to initial state after sending.
   */
  private resetForm() {
    this.messageContent = "";
    this.attachedFiles = [];
    this.onReplyingToChange(null);
    this.showFileSelector = false;
    this.vote = createEmptyVote();
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && event.ctrlKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleFileUploader() {
    this.showFileSelector = !this.showFileSelector;
  }

  toggleVoteMaker() {
    this.showVoteMaker = !this.showVoteMaker;
  }

  toggleEmojiPalette() {
    this.showEmojiPalette = !this.showEmojiPalette;
  }

  addEmoji(emoji: string) {
    this.messageContent += emoji;
  }

  removeFile(index: number) {
    this.attachedFiles.splice(index, 1);
  }
}

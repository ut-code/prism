import type { Message } from "@packages/api-client";
import type { MessageMutations } from "./messageList.mutations.svelte.ts";

/**
 * UI state and handlers for the message list.
 */
export class MessageListUI {
  clientX = $state(0);
  clientY = $state(0);
  visibleDropdown = $state<string | null>(null);
  reactionPaletteVisibleFor = $state<string | null>(null);
  editingMessageId = $state<string | null>(null);
  editedContent = $state("");

  constructor(
    private mutations: MessageMutations,
    private refetch: () => Promise<void>,
  ) {
    $effect(() => {
      const handleClick = () => {
        this.visibleDropdown = null;
      };
      document.addEventListener("click", handleClick);
      return () => {
        document.removeEventListener("click", handleClick);
      };
    });
  }

  calculateMenuPosition(e: MouseEvent) {
    const menuWidth = 160;
    this.clientX =
      e.clientX + menuWidth > window.innerWidth
        ? e.clientX - menuWidth
        : e.clientX;
    this.clientY = e.clientY;
  }

  showDropdown(messageId: string) {
    this.visibleDropdown = messageId;
  }

  showReactionPalette(messageId: string) {
    this.reactionPaletteVisibleFor = messageId;
    this.visibleDropdown = null;
  }

  closeReactionPalette() {
    this.reactionPaletteVisibleFor = null;
  }

  async handleEmojiSelected(emoji: string) {
    if (!this.reactionPaletteVisibleFor) return;
    await this.mutations.addReaction.run({
      messageId: this.reactionPaletteVisibleFor,
      emoji,
    });
    this.closeReactionPalette();
  }

  startEditing(message: Message) {
    this.editingMessageId = message.id;
    this.editedContent = message.content;
    this.visibleDropdown = null;
  }

  cancelEditing() {
    this.editingMessageId = null;
    this.editedContent = "";
  }

  async saveEdit(messageId: string) {
    if (!this.editedContent.trim()) return;
    await this.mutations.updateMessage.run({
      messageId,
      content: this.editedContent,
    });
    this.editingMessageId = null;
    this.editedContent = "";
    await this.refetch();
  }

  async handleDelete(messageId: string) {
    if (!confirm("Are you sure you want to delete this message?")) return;
    await this.mutations.deleteMessage.run({ messageId });
    await this.refetch();
  }

  async handlePin(
    messageId: string,
    messagesById: Map<string, Message>,
    mutations: MessageMutations,
  ) {
    const message = messagesById.get(messageId);
    if (!message) return;

    if (message.pinnedAt) {
      await mutations.unpinMessage.run({ messageId });
    } else {
      await mutations.pinMessage.run({ messageId });
    }
    await this.refetch();
    this.visibleDropdown = null;
  }
}

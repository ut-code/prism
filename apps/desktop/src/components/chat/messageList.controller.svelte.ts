import type { Message } from "@apps/api-client";
import {
  getApiClient,
  getMessage,
  unwrapResponse,
  useMutation,
  useQuery,
} from "@/lib/api.svelte";
import { useAuth } from "@/lib/auth.svelte";

/**
 * Controller for managing message list state and operations.
 * Handles fetching messages, managing UI state for dropdowns/palettes,
 * and coordinating user interactions.
 */
export class MessageListController {
  organizationId: string;
  channelId: string;

  // Data
  messages: ReturnType<typeof useQuery<Message[]>> & { refetch: () => Promise<void> };
  messagesById: Map<string, Message>;

  // UI State
  clientX = $state(0);
  clientY = $state(0);
  visibleDropdown = $state<string | null>(null);
  reactionPaletteVisibleFor = $state<string | null>(null);
  editingMessageId = $state<string | null>(null);
  editedContent = $state("");

  // Auth
  auth = useAuth();

  // Mutations
  addReaction: ReturnType<
    typeof useMutation<{ messageId: string; emoji: string }, unknown>
  >;
  updateMessage: ReturnType<
    typeof useMutation<{ messageId: string; content: string }, Message>
  >;
  deleteMessage: ReturnType<typeof useMutation<{ messageId: string }, unknown>>;
  pinMessage: ReturnType<typeof useMutation<{ messageId: string }, Message>>;
  unpinMessage: ReturnType<typeof useMutation<{ messageId: string }, Message>>;

  constructor(props: () => { organizationId: string; channelId: string }) {
    const api = getApiClient();
    this.organizationId = props().organizationId;
    this.channelId = props().channelId;

    this.messages = useQuery<Message[]>(async () => {
      const response = await api.messages.get({
        query: { channelId: this.channelId },
      });
      return unwrapResponse(response);
    }) as ReturnType<typeof useQuery<Message[]>> & { refetch: () => Promise<void> };

    this.messagesById = $derived(
      new Map(
        this.messages.data?.map((message: Message) => [message.id, message]),
      ),
    );

    this.addReaction = useMutation(
      async (args: { messageId: string; emoji: string }) => {
        const response = await getMessage(api, args.messageId).reactions.post({
          emoji: args.emoji,
        });
        return unwrapResponse(response);
      },
    );

    this.updateMessage = useMutation(
      async (args: { messageId: string; content: string }) => {
        const response = await getMessage(api, args.messageId).put({
          content: args.content,
        });
        return unwrapResponse(response);
      },
    );

    this.deleteMessage = useMutation(async (args: { messageId: string }) => {
      const response = await getMessage(api, args.messageId).delete();
      return unwrapResponse(response);
    });

    this.pinMessage = useMutation(async (args: { messageId: string }) => {
      const response = await api.messages
        .pins({ messageId: args.messageId })
        .post();
      return unwrapResponse(response);
    });

    this.unpinMessage = useMutation(async (args: { messageId: string }) => {
      const response = await api.messages
        .pins({ messageId: args.messageId })
        .delete();
      return unwrapResponse(response);
    });

    // Close dropdowns on click outside
    document.addEventListener("click", () => {
      this.visibleDropdown = null;
    });
  }

  /**
   * Calculate menu position to keep it within viewport bounds
   */
  calculateMenuPosition(e: MouseEvent) {
    const menuWidth = 160; // w-40
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
    await this.addReaction.run({
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
    await this.updateMessage.run({
      messageId,
      content: this.editedContent,
    });
    this.editingMessageId = null;
    this.editedContent = "";
    await this.messages.refetch();
  }

  async handleDelete(messageId: string) {
    if (!confirm("このメッセージを削除しますか？")) return;
    await this.deleteMessage.run({ messageId });
    await this.messages.refetch();
  }

  isOwnMessage(message: Message): boolean {
    return this.auth.user?.id === message.userId;
  }

  async handlePin(messageId: string) {
    const message = this.messagesById.get(messageId);
    if (!message) return;

    if (message.pinnedAt) {
      await this.unpinMessage.run({ messageId });
    } else {
      await this.pinMessage.run({ messageId });
    }
    await this.messages.refetch();
    this.visibleDropdown = null;
  }
}

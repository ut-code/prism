import type { Message } from "@apps/api-client";
import {
  getApiClient,
  getMessage,
  unwrapResponse,
  useMutation,
  useQuery,
} from "@/lib/api.svelte";

/**
 * Controller for managing message list state and operations.
 * Handles fetching messages, managing UI state for dropdowns/palettes,
 * and coordinating user interactions.
 */
export class MessageListController {
  organizationId: string;
  channelId: string;

  // Data
  messages: ReturnType<typeof useQuery<Message[]>>;
  messagesById: Map<string, Message>;

  // UI State
  clientX = $state(0);
  clientY = $state(0);
  visibleDropdown = $state<string | null>(null);
  reactionPaletteVisibleFor = $state<string | null>(null);

  // Mutations
  addReaction: ReturnType<typeof useMutation>;

  constructor(props: () => { organizationId: string; channelId: string }) {
    const api = getApiClient();
    this.organizationId = props().organizationId;
    this.channelId = props().channelId;

    this.messages = useQuery<Message[]>(async () => {
      const response = await api.messages.get({
        query: { channelId: this.channelId },
      });
      return unwrapResponse(response);
    });

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
}

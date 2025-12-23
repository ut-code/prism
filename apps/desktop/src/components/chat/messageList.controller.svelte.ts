import type { Message } from "@apps/api-client";
import { getApiClient, unwrapResponse, useQuery } from "@/lib/api.svelte";
import { useAuth } from "@/lib/auth.svelte";
import {
  createMessageMutations,
  type MessageMutations,
} from "./messageList.mutations.svelte.ts";
import { MessageListUI } from "./messageList.ui.svelte.ts";
import { setupWebSocketHandlers } from "./messageList.websocket.svelte.ts";

/**
 * Controller for managing message list state and operations.
 */
export class MessageListController {
  organizationId: string;
  channelId: string;

  // Data
  messages: ReturnType<typeof useQuery<Message[]>> & {
    refetch: () => Promise<void>;
  };
  messagesById: Map<string, Message>;
  messagesData = $state<Message[]>([]);

  // Auth
  auth = useAuth();

  // UI
  ui: MessageListUI;

  // Mutations (exposed for compatibility)
  mutations: MessageMutations;

  constructor(props: () => { organizationId: string; channelId: string }) {
    const api = getApiClient();
    this.organizationId = $derived(props().organizationId);
    this.channelId = $derived(props().channelId);

    this.messages = useQuery<Message[]>(async () => {
      const response = await api.messages.get({
        query: { channelId: this.channelId },
      });
      return unwrapResponse(response);
    }) as ReturnType<typeof useQuery<Message[]>> & {
      refetch: () => Promise<void>;
    };

    this.messagesById = $derived(
      new Map(
        this.messagesData.map((message: Message) => [message.id, message]),
      ),
    );

    $effect(() => {
      if (this.messages.data) {
        this.messagesData = this.messages.data;
      }
    });

    this.mutations = createMessageMutations();
    this.ui = new MessageListUI(this.mutations, () => this.messages.refetch());

    setupWebSocketHandlers(
      this.channelId,
      this.messagesData,
      this.messagesById,
      (messages) => {
        this.messagesData = messages;
      },
    );
  }

  // UI state delegation
  get clientX() {
    return this.ui.clientX;
  }
  get clientY() {
    return this.ui.clientY;
  }
  get visibleDropdown() {
    return this.ui.visibleDropdown;
  }
  set visibleDropdown(v: string | null) {
    this.ui.visibleDropdown = v;
  }
  get reactionPaletteVisibleFor() {
    return this.ui.reactionPaletteVisibleFor;
  }
  get editingMessageId() {
    return this.ui.editingMessageId;
  }
  get editedContent() {
    return this.ui.editedContent;
  }
  set editedContent(v: string) {
    this.ui.editedContent = v;
  }

  // UI methods delegation
  calculateMenuPosition = (e: MouseEvent) => this.ui.calculateMenuPosition(e);
  showDropdown = (id: string) => this.ui.showDropdown(id);
  showReactionPalette = (id: string) => this.ui.showReactionPalette(id);
  closeReactionPalette = () => this.ui.closeReactionPalette();
  handleEmojiSelected = (emoji: string) => this.ui.handleEmojiSelected(emoji);
  startEditing = (msg: Message) => this.ui.startEditing(msg);
  cancelEditing = () => this.ui.cancelEditing();
  saveEdit = (id: string) => this.ui.saveEdit(id);
  handleDelete = (id: string) => this.ui.handleDelete(id);
  handlePin = (id: string) =>
    this.ui.handlePin(id, this.messagesById, this.mutations);

  isOwnMessage(message: Message): boolean {
    return this.auth.user?.id === message.userId;
  }
}

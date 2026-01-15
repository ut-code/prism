import type { Message } from "@packages/api-client";
import {
  subscribeChannel,
  unsubscribeChannel,
  useWebSocket,
} from "@/lib/websocket";

function isMessage(obj: unknown): obj is Message {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "id" in obj &&
    "content" in obj &&
    "userId" in obj &&
    "channelId" in obj &&
    "createdAt" in obj
  );
}

/**
 * WebSocket event handlers for the message list.
 */
export function setupWebSocketHandlers(
  channelId: string,
  messagesData: Message[],
  messagesById: Map<string, Message>,
  setMessagesData: (messages: Message[]) => void,
) {
  $effect(() => {
    subscribeChannel(channelId);
    return () => unsubscribeChannel(channelId);
  });

  useWebSocket("message:created", (event) => {
    if (event.channelId === channelId && isMessage(event.message)) {
      const newMessage = event.message;
      if (!messagesById.get(newMessage.id)) {
        setMessagesData([...messagesData, newMessage]);
      }
    }
  });

  useWebSocket("message:updated", (event) => {
    if (event.channelId === channelId && isMessage(event.message)) {
      const updated = event.message;
      setMessagesData(
        messagesData.map((m) => (m.id === updated.id ? updated : m)),
      );
    }
  });

  useWebSocket("message:deleted", (event) => {
    if (event.channelId === channelId) {
      setMessagesData(messagesData.filter((m) => m.id !== event.messageId));
    }
  });
}

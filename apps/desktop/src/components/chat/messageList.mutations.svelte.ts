import {
  getApiClient,
  getMessage,
  unwrapResponse,
  useMutation,
} from "@/lib/api.svelte";

/**
 * Message mutations for the message list.
 */
export function createMessageMutations() {
  const api = getApiClient();

  const addReaction = useMutation(
    async (args: { messageId: string; emoji: string }) => {
      const response = await getMessage(api, args.messageId).reactions.post({
        emoji: args.emoji,
      });
      return unwrapResponse(response);
    },
  );

  const updateMessage = useMutation(
    async (args: { messageId: string; content: string }) => {
      const response = await getMessage(api, args.messageId).put({
        content: args.content,
      });
      return unwrapResponse(response);
    },
  );

  const deleteMessage = useMutation(async (args: { messageId: string }) => {
    const response = await getMessage(api, args.messageId).delete();
    return unwrapResponse(response);
  });

  const pinMessage = useMutation(async (args: { messageId: string }) => {
    const response = await api.messages
      .pins({ messageId: args.messageId })
      .post();
    return unwrapResponse(response);
  });

  const unpinMessage = useMutation(async (args: { messageId: string }) => {
    const response = await api.messages
      .pins({ messageId: args.messageId })
      .delete();
    return unwrapResponse(response);
  });

  return {
    addReaction,
    updateMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
  };
}

export type MessageMutations = ReturnType<typeof createMessageMutations>;

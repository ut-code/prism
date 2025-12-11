import type { User } from "@apps/api-client";
import {
  getApiClient,
  unwrapResponse,
  useMutation,
  useQuery,
} from "@/lib/api.svelte";
import type { Vote } from "./messageInputUtils.ts";

/**
 * API operations for message input.
 * Handles message sending, vote creation, and user identity fetching.
 */
export class MessageInputApi {
  private api = getApiClient();

  sendMessageMutation = useMutation(
    async (args: {
      channelId: string;
      content: string;
      author: string;
      parentId?: string;
      attachments?: string[];
      voteId?: string;
    }) => {
      const response = await this.api.messages.post(args);
      return unwrapResponse(response);
    },
  );

  identity = useQuery<User>(async () => {
    const response = await this.api.users.me.get();
    return unwrapResponse(response);
  });

  /**
   * Creates a vote and returns its ID.
   * Returns undefined if creation fails.
   */
  async createVote(vote: Vote): Promise<string | undefined> {
    const voteResponse = await this.api.votes.post({
      title: vote.title,
      maxVotes: vote.maxVotes,
      voteOptions: vote.voteOptions,
    });

    if (!voteResponse.error && voteResponse.data) {
      return voteResponse.data.id;
    }
    return undefined;
  }
}

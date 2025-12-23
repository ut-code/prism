/**
 * Utility functions for message input validation and state management.
 */

export type Vote = {
  title: string;
  maxVotes: number;
  voteOptions: Array<string>;
  voters: Array<{
    userId: string;
    votedOptions: Array<number>;
  }>;
};

/**
 * Creates an empty vote object with default values.
 */
export function createEmptyVote(): Vote {
  return {
    title: "",
    maxVotes: 1,
    voteOptions: [],
    voters: [],
  };
}

/**
 * Checks if a vote has valid data for submission.
 */
export function isVoteValid(vote: Vote): boolean {
  if (!vote.title.trim()) return false;
  if (vote.voteOptions.length === 0) return false;
  if (vote.maxVotes === 0) return false;
  return true;
}

/**
 * Checks if message input is ready to be sent.
 */
export function canSendMessage(
  messageContent: string,
  attachedFilesCount: number,
  vote: Vote,
  isProcessing: boolean,
  hasIdentity: boolean,
): boolean {
  if (isProcessing) return false;
  if (!hasIdentity) return false;
  if (!messageContent.trim() && attachedFilesCount === 0 && !isVoteValid(vote))
    return false;
  return true;
}

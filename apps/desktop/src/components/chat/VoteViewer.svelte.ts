import type { User, Vote } from "@packages/api-client";
import {
  getApiClient,
  getVote,
  unwrapResponse,
  useQuery,
} from "@/lib/api.svelte";
import { proxify } from "@/lib/proxify.svelte";

/**
 * Controller for VoteViewer component.
 * Manages vote data, vote casting, and result visibility.
 */
export class VoteViewerController {
  private api = getApiClient();
  private voteId: string;

  vote: ReturnType<typeof useQuery<Vote>>;
  me: ReturnType<typeof useQuery<User>>;
  isCasting = $state(false);

  constructor(props: () => { voteId: string }) {
    this.voteId = $derived(props().voteId);
    this.vote = useQuery<Vote>(async () => {
      const response = await getVote(this.api, this.voteId).get();
      return unwrapResponse(response);
    });
    this.me = useQuery<User>(async () => {
      const response = await this.api.users.me.get();
      return unwrapResponse(response);
    });
  }

  numbersOfVotersPerOption = $derived(this.calculateVotes());
  myVotesData = $derived(proxify(this.computeMyVotes()));
  isResultVisible = $derived(this.myVotesData.isResultVisible);
  selectedOptions = $derived(this.myVotesData.selectedOptions);

  private computeMyVotes() {
    let isResultVisible = false;
    let selectedOptions: number[] = [];

    if (!this.vote.data || !this.me.data) {
      return { selectedOptions, isResultVisible };
    }

    for (const voter of this.vote.data.voters) {
      if (voter.userId === this.me.data.id) {
        selectedOptions = voter.votedOptions;
        isResultVisible = true;
        break;
      }
    }

    return { isResultVisible, selectedOptions };
  }

  private calculateVotes(): number[] {
    if (!this.vote.data) {
      return [];
    }

    const numbersOfVotersPerOption: number[] = [];
    for (let i = 0; i < this.vote.data.voteOptions.length; i++) {
      let num = 0;
      for (const voter of this.vote.data.voters) {
        if (voter.votedOptions.includes(i)) {
          num++;
        }
      }
      numbersOfVotersPerOption.push(num);
    }

    return numbersOfVotersPerOption;
  }

  clickableStatus(i: number): "selected" | "can select" | "capped" {
    if (this.hasInSelectedOptions(i)) return "selected";
    if (this.vote.data && this.selectedOptions.length < this.vote.data.maxVotes)
      return "can select";
    return "capped";
  }

  toggleSelectionOption(i: number) {
    if (this.selectedOptions.includes(i)) {
      this.removeFromSelectedOptions(i);
    } else {
      this.addToSelectedOptions(i);
    }
  }

  hasInSelectedOptions(i: number) {
    return this.selectedOptions.includes(i);
  }

  removeFromSelectedOptions(i: number) {
    this.myVotesData.selectedOptions = this.selectedOptions.filter(
      (op) => op !== i,
    );
  }

  addToSelectedOptions(i: number) {
    if (
      this.vote.data &&
      this.selectedOptions.length < this.vote.data.maxVotes
    ) {
      this.myVotesData.selectedOptions.push(i);
    }
  }

  async castVote() {
    if (this.me.data && !this.isCasting) {
      const voteRoute = getVote(this.api, this.voteId);
      if (voteRoute.cast) {
        this.isCasting = true;
        try {
          const response = await voteRoute.cast.post({
            votedOptions: this.selectedOptions,
          });
          unwrapResponse(response);
        } catch (error) {
          console.error("Failed to cast vote:", error);
        } finally {
          this.isCasting = false;
        }
      }
    }
  }
}

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const addVote = mutation({
  args: {
    title: v.string(),
    maxVotes: v.number(),
    voteOptions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("votes", {
      title: args.title,
      maxVotes: args.maxVotes,
      voteOptions: args.voteOptions,
      voters: [],
    });
    return id;
  },
});

export const getVote = query({
  args: {
    id: v.id("votes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const vote = mutation({
  args: {
    voteId: v.id("votes"),
    userId: v.id("users"),
    votedOptions: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const vote = await ctx.db.get(args.voteId);
    const tempVoters = vote?.voters.filter(
      (v: { userId: Id<"users">; votedOptions: Array<number> }) =>
        v.userId !== args.userId,
    );
    await ctx.db.patch(args.voteId, {
      voters: [
        ...tempVoters,
        { userId: args.userId, votedOptions: args.votedOptions },
      ],
    });
  },
});

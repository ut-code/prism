import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    return tasks;
  },
});

export const create = mutation({
  args: {
    text: v.string(),
    assigner: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("tasks", { ...args, isCompleted: false });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    text: v.optional(v.string()),
    isCompleted: v.optional(v.boolean()),
    assigner: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const mutation: Partial<{
      text: string;
      isCompleted: boolean;
      assigner: string;
    }> = {};
    if (args.isCompleted !== undefined) {
      mutation.isCompleted = args.isCompleted;
    }
    if (args.text !== undefined) {
      mutation.text = args.text;
    }
    if (args.assigner !== undefined) {
      mutation.assigner = args.assigner;
    }
    await ctx.db.patch(args.id, mutation);
  },
});

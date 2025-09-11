import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getMessagePerms, validateFileAttachments } from "./perms";

export const list = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const perms = await getMessagePerms(ctx, {
      channelId: args.channelId,
    });
    if (!perms.read) {
      throw new Error("Insufficient permissions");
    }
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
    author: v.string(),
    parentId: v.optional(v.id("messages")),
    attachments: v.optional(v.array(v.id("files"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const perms = await getMessagePerms(ctx, {
      channelId: args.channelId,
    });
    if (!perms.create) {
      throw new Error("Insufficient permissions");
    }

    // 添付ファイルの検証
    if (args.attachments && args.attachments.length > 0) {
      await validateFileAttachments(ctx, args.attachments, args.channelId);
    }

    await ctx.db.insert("messages", {
      channelId: args.channelId,
      content: args.content,
      author: args.author,
      userId: userId,
      createdAt: Date.now(),
      parentId: args.parentId,
      attachments: args.attachments,
    });
  },
});

export const getReactions = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();
  },
});

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const existingReaction = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    if (existingReaction) {
      return;
    }

    await ctx.db.insert("reactions", {
      messageId: args.messageId,
      userId: userId,
      emoji: args.emoji,
      createdAt: Date.now(),
    });
  },
});

export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const reaction = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    if (reaction) {
      await ctx.db.delete(reaction._id);
    }
  },
});

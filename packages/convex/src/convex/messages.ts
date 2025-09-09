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
      createdAt: Date.now(),
      parentId: args.parentId,
      attachments: args.attachments,
    });
  },
});

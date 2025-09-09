import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const save = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args: { name: string }): Promise<void> => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const data = await ctx.db
        .query("personalization")
        .filter((q) => q.eq(q.field("userId"), userId))
        .unique();

      if (data) {
        await ctx.db.patch(data._id, {
          nickname: args.name,
        });
      } else {
        await ctx.db.insert("personalization", {
          userId: userId,
          nickname: args.name,
          icon: null,
        });
      }
    }
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveImage = mutation({
  args: {
    icon: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const data = await ctx.db
        .query("personalization")
        .filter((q) => q.eq(q.field("userId"), userId))
        .unique();

      if (data) {
        if (data.icon) {
          await ctx.storage.delete(data.icon);
        }
        await ctx.db.patch(data._id, {
          icon: args.icon,
        });
      } else {
        await ctx.db.insert("personalization", {
          userId: userId,
          nickname: "",
          icon: args.icon,
        });
      }
    }
  },
});

export const getPersonalization = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const user = await ctx.db
        .query("personalization")
        .filter((q) => q.eq(q.field("userId"), userId))
        .unique();
      if (user) {
        return await ctx.db.get(user._id);
      }
    }
  },
});

export const getImageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

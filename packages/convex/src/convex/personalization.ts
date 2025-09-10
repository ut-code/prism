import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const save = mutation({
  args: {
    nickName: v.string(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args): Promise<void> => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const data = await ctx.db
        .query("personalization")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
        .unique();

      if (data) {
        await ctx.db.patch(data._id, {
          nickname: args.nickName,
        });
      } else {
        await ctx.db.insert("personalization", {
          userId: userId,
          organizationId: args.organizationId,
          nickname: args.nickName,
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
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const data = await ctx.db
        .query("personalization")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
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
          organizationId: args.organizationId,
          icon: args.icon,
        });
      }
    }
  },
});

export const getPersonalization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const user = await ctx.db
        .query("personalization")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
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

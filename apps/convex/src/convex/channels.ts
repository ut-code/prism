import { v } from "convex/values";
import { mutation, query } from "./_generated/server.ts";
import { getChannelPerms } from "./perms.ts";

export const list = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const perms = await getChannelPerms(ctx, {
      organizationId: args.organizationId,
    });
    if (!perms.read) {
      throw new Error("Insufficient permissions");
    }

    return await ctx.db
      .query("channels")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const perms = await getChannelPerms(ctx, {
      organizationId: args.organizationId,
    });
    if (!perms.write) {
      throw new Error("Insufficient permissions");
    }

    const channelId = await ctx.db.insert("channels", {
      name: args.name,
      description: args.description,
      organizationId: args.organizationId,
      createdAt: Date.now(),
    });
    return channelId;
  },
});

export const get = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const perms = await getChannelPerms(ctx, { channelId: args.channelId });
    if (!perms.read) {
      throw new Error("Insufficient permissions");
    }
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      return null;
    }

    return channel;
  },
});

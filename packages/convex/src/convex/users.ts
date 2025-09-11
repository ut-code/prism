import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const getUserNames = query({
  args: {
    userIds: v.array(v.id("users")),
  },
  handler: async (ctx, { userIds }) => {
    const users = await Promise.all(
      userIds.map((userId) => ctx.db.get(userId)),
    );
    const userNames: Record<Id<"users">, string> = Object.fromEntries(
      users
        .filter((user) => user !== null)
        .map((user) => [user._id, user.name ?? ""]),
    );

    return userNames;
  },
});

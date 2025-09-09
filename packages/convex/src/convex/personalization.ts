import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const save = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId !== null) {
      if (args.name !== "") {
        await ctx.db.patch(userId, { name: args.name });
      }
    }
  },
});

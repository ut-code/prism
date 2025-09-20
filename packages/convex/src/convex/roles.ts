import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganizationPerms } from "./perms";

export const get = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("roles")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .collect();
  },
});

export const createRole = mutation({
  args: {
    organizationId: v.id("organizations"),
    roleName: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("roles", {
      organizationId: args.organizationId,
      roleName: args.roleName,
      color: args.color,
    });
  },
});

export const updateRole = mutation({
  args: {
    roleId: v.id("roles"),
    roleName: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.roleId, {
      roleName: args.roleName,
      color: args.color,
    });
  },
});

export const deleteRole = mutation({
  args: {
    roleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.roleId);
  },
});

export const updateMemberRole = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    roleIds: v.array(v.id("roles")),
  },
  handler: async (ctx, args) => {
    const perms = await getOrganizationPerms(ctx, { id: args.organizationId });
    if (!perms.members.updateRole) {
      throw new Error("Insufficient permissions");
    }

    const targetMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!targetMembership) {
      throw new Error("User is not a member");
    }

    await ctx.db.patch(targetMembership._id, {
      roleIds: args.roleIds,
    });
  },
});

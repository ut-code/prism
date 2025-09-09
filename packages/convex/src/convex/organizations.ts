import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganizationPerms } from "./perms";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      description: args.description,
      createdAt: Date.now(),
      ownerId: userId,
    });

    await ctx.db.insert("organizationMembers", {
      organizationId,
      userId,
      permission: "admin",
      joinedAt: Date.now(),
    });

    return organizationId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return {
          ...org,
          permission: membership.permission,
          role: membership.role,
        };
      }),
    );

    return organizations.filter((org) => org !== null);
  },
});

export const get = query({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    const perms = await getOrganizationPerms(ctx, { id: args.id });

    return {
      ...perms.organization,
      permission: perms.membership.permission,
      role: perms.membership.role,
    };
  },
});

export const update = mutation({
  args: {
    id: v.id("organizations"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const perms = await getOrganizationPerms(ctx, { id: args.id });
    if (!perms.info.update) {
      throw new Error("Insufficient permissions");
    }
    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
    });
  },
});

export const addMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.optional(v.string()),
    permission: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("visitor"),
    ),
  },
  handler: async (ctx, args) => {
    const perms = await getOrganizationPerms(ctx, { id: args.organizationId });
    if (!perms.members.invite) {
      throw new Error("Insufficient permissions");
    }

    const existingMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existingMembership) {
      throw new Error("User is already a member");
    }

    await ctx.db.insert("organizationMembers", {
      organizationId: args.organizationId,
      userId: args.userId,
      role: args.role,
      permission: args.permission,
      joinedAt: Date.now(),
    });
  },
});

export const removeMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const perms = await getOrganizationPerms(ctx, { id: args.organizationId });
    if (!perms.members.kick) {
      throw new Error("Insufficient permissions");
    }
    if (args.userId === perms.membership.userId) {
      throw new Error("Cannot kick yourself");
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

    await ctx.db.delete(targetMembership._id);
  },
});

export const getMembers = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const perms = await getOrganizationPerms(ctx, { id: args.organizationId });
    if (!perms.members.read) {
      throw new Error("Insufficient permissions");
    }

    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          ...membership,
          user,
        };
      }),
    );

    return members.filter((member) => member.user !== null);
  },
});

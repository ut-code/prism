import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    assigner: v.string(),
  }),
  organizations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    ownerId: v.id("users"),
  }),
  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("visitor"),
    ),
    joinedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"]),
  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    organizationId: v.id("organizations"),
    createdAt: v.number(),
  }).index("by_organization", ["organizationId"]),
  messages: defineTable({
    channelId: v.id("channels"),
    content: v.string(),
    author: v.string(),
    createdAt: v.number(),
    parentId: v.optional(v.id("messages")),
  }).index("by_channel", ["channelId"]),
  ...authTables,
});

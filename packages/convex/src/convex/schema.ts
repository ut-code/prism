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
    roleIds: v.array(v.id("roles")),
    permission: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("visitor"),
    ),
    joinedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"]),
  roles: defineTable({
    organizationId: v.id("organizations"),
    roleName: v.string(),
  }).index("by_organization", ["organizationId"]),
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
    userId: v.id("users"),
    createdAt: v.number(),
    parentId: v.optional(v.id("messages")),
    // 添付ファイル
    attachments: v.optional(v.array(v.id("files"))),
  }).index("by_channel", ["channelId"]),
  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
    createdAt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"]),
  personalization: defineTable({
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    nickname: v.string(),
    icon: v.union(v.id("_storage"), v.null()),
  }),
  files: defineTable({
    // Convex Storage ID
    storageId: v.string(),
    // ファイル情報
    filename: v.string(),
    originalFilename: v.string(),
    mimeType: v.string(),
    size: v.number(), // bytes
    // メタデータ
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
    organizationId: v.id("organizations"),
    // 画像の場合の追加情報
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  })
    .index("by_organization", ["organizationId"])
    .index("by_uploader", ["uploadedBy"]),
  ...authTables,
});

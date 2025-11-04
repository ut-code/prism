import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

/**

# Channel Permissions

[Fellow = Everyone in the organization = admin, member, visitor]

- Fellow can list channels and get channel details.
- Admin and member can create, update and delete channels.

 */

export async function getChannelPerms(
  ctx: QueryCtx,
  query:
    | {
        channelId: Id<"channels">;
      }
    | {
        organizationId: Id<"organizations">;
      },
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  const organizationId =
    "organizationId" in query
      ? query.organizationId
      : (await ctx.db.get(query.channelId))?.organizationId;

  if (!organizationId) {
    throw new Error("Organization not found");
  }

  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();

  if (!membership) {
    throw new Error("User is not a member of the organization");
  }

  return {
    userId,
    membership,
    read: true,
    write:
      membership.permission === "admin" || membership.permission === "member",
  };
}

/**
# Messages

- Fellow can list messages and get message details.
- Fellow can create messages.
- Only the creator can update a message.
- Creator and admin can delete a message.

*/
export async function getMessagePerms(
  ctx: QueryCtx,
  query:
    | {
        messageId: Id<"messages">;
      }
    | {
        channelId: Id<"channels">;
      },
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  const { message, channel } = await (async () => {
    if ("messageId" in query) {
      const message = await ctx.db.get(query.messageId);
      if (!message) {
        throw new Error("Message not found");
      }
      const channel = await ctx.db.get(message.channelId);
      return { message, channel };
    } else {
      const channel = await ctx.db.get(query.channelId);
      if (!channel) {
        throw new Error("Channel not found");
      }
      return { message: null, channel };
    }
  })();

  const organizationId = channel?.organizationId;
  if (!organizationId) {
    throw new Error("Channel not found");
  }

  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();

  if (!membership) {
    throw new Error("User is not a member of the organization");
  }

  return {
    userId,
    membership,
    read: true,
    create: true,
    update: message?.author === userId,
    delete: message?.author === userId || membership.permission === "admin",
  };
}

/**
# Organizations

- Anyone can create organizations. (it does not call this function)
- Anyone can list their organizations.
- Fellow can get organization details.
- Only admin can update and delete organizations.
- Only admin can add members to the organization.
- Only admin can remove members from the organization.
- Only admin can update members' permissions.
 */
export async function getOrganizationPerms(
  ctx: QueryCtx,
  query: { id: Id<"organizations"> },
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  const organization = await ctx.db.get(query.id);
  if (!organization) {
    throw new Error("Organization not found");
  }

  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_organization", (q) =>
      q.eq("organizationId", organization._id),
    )
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();

  if (!membership) {
    throw new Error("User is not a member of the organization");
  }

  return {
    userId,
    membership,
    organization,
    delete: membership.permission === "admin",
    info: {
      read: true,
      update: membership.permission === "admin",
    },
    members: {
      read: true,
      invite: membership.permission === "admin",
      changePermission: membership.permission === "admin",
      kick: membership.permission === "admin",
    },
  };
}

/**
# Files

- Fellow can upload files to the organization.
- Fellow can view files in the organization.
- File uploader and admin can delete files.
- Attachments must belong to the same organization as the channel.

*/
export async function getFilePerms(
  ctx: QueryCtx,
  query:
    | {
        fileId: Id<"files">;
      }
    | {
        organizationId: Id<"organizations">;
      },
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  const { file, organizationId } = await (async () => {
    if ("fileId" in query) {
      const file = await ctx.db.get(query.fileId);
      if (!file) {
        throw new Error("File not found");
      }
      return { file, organizationId: file.organizationId };
    } else {
      return { file: null, organizationId: query.organizationId };
    }
  })();

  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();

  if (!membership) {
    throw new Error("User is not a member of the organization");
  }

  return {
    userId,
    membership,
    file,
    organizationId,
    read: true,
    upload: true,
    delete: file?.uploadedBy === userId || membership.permission === "admin",
  };
}

/**
 * Validate file attachments for message creation
 * Ensures all files belong to the same organization as the channel
 */
export async function validateFileAttachments(
  ctx: QueryCtx,
  fileIds: Id<"files">[],
  channelId: Id<"channels">,
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  const channel = await ctx.db.get(channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }

  for (const fileId of fileIds) {
    const file = await ctx.db.get(fileId);
    if (!file) {
      throw new Error(`File not found: ${fileId}`);
    }

    if (file.organizationId !== channel.organizationId) {
      throw new Error("File attachment belongs to different organization");
    }
  }
}

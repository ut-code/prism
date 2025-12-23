import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channels, messageAttachments, messages } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { wsManager } from "../../ws/manager.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";

/**
 * Handles creating new messages.
 */
export const messageCreateRoutes = new Elysia().use(authMiddleware).post(
  "/",
  async ({ user, body, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, body.channelId))
      .limit(1);

    if (!channel) {
      set.status = 404;
      return { message: "Channel not found" };
    }

    await requireOrganizationMembership(user.id, channel.organizationId);

    const [message] = await db
      .insert(messages)
      .values({
        channelId: body.channelId,
        content: body.content,
        author: body.author,
        userId: user.id,
        parentId: body.parentId,
        voteId: body.voteId,
      })
      .returning();

    // Handle attachments
    if (body.attachments && body.attachments.length > 0 && message) {
      await db.insert(messageAttachments).values(
        body.attachments.map((fileId: string) => ({
          messageId: message.id,
          fileId,
        })),
      );
    }

    wsManager.broadcast(body.channelId, {
      type: "message:created",
      channelId: body.channelId,
      message,
    });

    return message;
  },
  {
    body: t.Object({
      channelId: t.String(),
      content: t.String(),
      author: t.String(),
      parentId: t.Optional(t.String()),
      attachments: t.Optional(t.Array(t.String())),
      voteId: t.Optional(t.String()),
    }),
    query: t.Object({
      channelId: t.Optional(t.String()),
    }),
  },
);

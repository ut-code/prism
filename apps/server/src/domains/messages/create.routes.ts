import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channels, messageAttachments, messages } from "../../db/schema.ts";
import {
  handleError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../lib/errors.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { wsManager } from "../../ws/manager.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";

/**
 * Handles creating new messages.
 */
export const messageCreateRoutes = new Elysia().use(authMiddleware).post(
  "/",
  async ({ user, body, set }) => {
    try {
      if (!user) throw new UnauthorizedError();

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, body.channelId))
        .limit(1);

      if (!channel) throw new NotFoundError("Channel", "CHANNEL_NOT_FOUND");

      await requireOrganizationMembership(user.id, channel.organizationId);

      const [message] = await db
        .insert(messages)
        .values({
          channelId: body.channelId,
          content: body.content,
          author: user.name || user.email,
          userId: user.id,
          parentId: body.parentId,
          voteId: body.voteId,
        })
        .returning();

      if (!message) {
        throw new InternalServerError(
          "Failed to create message",
          "MESSAGE_CREATE_FAILED",
        );
      }

      // Handle attachments
      if (body.attachments && body.attachments.length > 0) {
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
    } catch (error) {
      return handleError(error, set);
    }
  },
  {
    body: t.Object({
      channelId: t.String(),
      content: t.String(),
      parentId: t.Optional(t.String()),
      attachments: t.Optional(t.Array(t.String())),
      voteId: t.Optional(t.String()),
    }),
    query: t.Object({
      channelId: t.Optional(t.String()),
    }),
  },
);

import { asc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { channels, messageAttachments, messages } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";
import { requireOrganizationMembership } from "../organizations/permissions";
import { messageReactionRoutes } from "./reactions";

/**
 * Handles message-related operations for channels.
 * Provides endpoints to list and create messages.
 */
export const messageRoutes = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .use(messageReactionRoutes)
  .get("/", async ({ user, query, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
    if (!query.channelId) {
      set.status = 400;
      return { message: "channelId is required" };
    }

    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, query.channelId))
      .limit(1);

    if (!channel) {
      set.status = 404;
      return { message: "Channel not found" };
    }

    await requireOrganizationMembership(user.id, channel.organizationId);

    const messageList = await db
      .select()
      .from(messages)
      .where(eq(messages.channelId, query.channelId))
      .orderBy(asc(messages.createdAt));

    return messageList;
  })
  .post(
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

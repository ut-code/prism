import { and, asc, eq, ilike } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import {
  channels,
  messageAttachments,
  messages,
  users,
} from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";
import { messagePinRoutes } from "./pins.ts";
import { messageReactionRoutes } from "./reactions.ts";

/**
 * Handles message-related operations for channels.
 * Provides endpoints to list and create messages.
 */
export const messageRoutes = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .use(messageReactionRoutes)
  .use(messagePinRoutes)
  .get(
    "/search",
    async ({ user, query, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      if (!query.q || !query.channelId) {
        set.status = 400;
        return { message: "q and channelId are required" };
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

      const limit = query.limit ?? 20;
      const offset = query.offset ?? 0;

      const results = await db
        .select({
          message: messages,
          user: users,
          channel: channels,
        })
        .from(messages)
        .leftJoin(users, eq(messages.userId, users.id))
        .leftJoin(channels, eq(messages.channelId, channels.id))
        .where(
          and(
            eq(messages.channelId, query.channelId),
            ilike(messages.content, `%${query.q}%`),
          ),
        )
        .orderBy(asc(messages.createdAt))
        .limit(limit)
        .offset(offset);

      return results;
    },
    {
      query: t.Object({
        q: t.String(),
        channelId: t.String(),
        limit: t.Optional(t.Number()),
        offset: t.Optional(t.Number()),
      }),
    },
  )
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
  )
  .put(
    "/:id",
    async ({ user, params, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, params.id))
        .limit(1);

      if (!message) {
        set.status = 404;
        return { message: "Message not found" };
      }

      if (message.userId !== user.id) {
        set.status = 403;
        return { message: "Forbidden: You can only edit your own messages" };
      }

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, message.channelId))
        .limit(1);

      if (!channel) {
        set.status = 404;
        return { message: "Channel not found" };
      }

      await requireOrganizationMembership(user.id, channel.organizationId);

      const [updatedMessage] = await db
        .update(messages)
        .set({
          content: body.content,
          editedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(messages.id, params.id))
        .returning();

      return updatedMessage;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        content: t.String(),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ user, params, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, params.id))
        .limit(1);

      if (!message) {
        set.status = 404;
        return { message: "Message not found" };
      }

      if (message.userId !== user.id) {
        set.status = 403;
        return { message: "Forbidden: You can only delete your own messages" };
      }

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, message.channelId))
        .limit(1);

      if (!channel) {
        set.status = 404;
        return { message: "Channel not found" };
      }

      await requireOrganizationMembership(user.id, channel.organizationId);

      await db.delete(messages).where(eq(messages.id, params.id));

      return { success: true };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );

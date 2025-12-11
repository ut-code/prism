import { and, asc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import {
  channels,
  messageAttachments,
  messages,
  reactions,
} from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";
import { requireOrganizationMembership } from "../organizations/permissions";

export const messageRoutes = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
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
  .get("/:id/reactions", async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const reactionList = await db
      .select()
      .from(reactions)
      .where(eq(reactions.messageId, params.id));

    return reactionList;
  })
  .post(
    "/:id/reactions",
    async ({ user, params, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      // Check if reaction already exists
      const [existing] = await db
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.messageId, params.id),
            eq(reactions.userId, user.id),
            eq(reactions.emoji, body.emoji),
          ),
        )
        .limit(1);

      if (existing) {
        return existing;
      }

      const [reaction] = await db
        .insert(reactions)
        .values({
          messageId: params.id,
          userId: user.id,
          emoji: body.emoji,
        })
        .returning();

      return reaction;
    },
    {
      body: t.Object({
        emoji: t.String(),
      }),
    },
  )
  .delete("/:id/reactions/:emoji", async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    await db
      .delete(reactions)
      .where(
        and(
          eq(reactions.messageId, params.id),
          eq(reactions.userId, user.id),
          eq(reactions.emoji, params.emoji),
        ),
      );

    return { success: true };
  });

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
  .get("/", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });
    if (!ctx.query.channelId)
      return ctx.error(400, { message: "channelId is required" });

    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, ctx.query.channelId))
      .limit(1);

    if (!channel) {
      return ctx.error(404, { message: "Channel not found" });
    }

    await requireOrganizationMembership(ctx.user.id, channel.organizationId);

    const messageList = await db
      .select()
      .from(messages)
      .where(eq(messages.channelId, ctx.query.channelId))
      .orderBy(asc(messages.createdAt));

    return messageList;
  })
  .post(
    "/",
    async (ctx: any) => {
      if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, ctx.body.channelId))
        .limit(1);

      if (!channel) {
        return ctx.error(404, { message: "Channel not found" });
      }

      await requireOrganizationMembership(ctx.user.id, channel.organizationId);

      const [message] = await db
        .insert(messages)
        .values({
          channelId: ctx.body.channelId,
          content: ctx.body.content,
          author: ctx.body.author,
          userId: ctx.user.id,
          parentId: ctx.body.parentId,
          voteId: ctx.body.voteId,
        })
        .returning();

      // Handle attachments
      if (ctx.body.attachments && ctx.body.attachments.length > 0 && message) {
        await db.insert(messageAttachments).values(
          ctx.body.attachments.map((fileId: string) => ({
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
  .get("/:id/reactions", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    const reactionList = await db
      .select()
      .from(reactions)
      .where(eq(reactions.messageId, ctx.params.id));

    return reactionList;
  })
  .post(
    "/:id/reactions",
    async (ctx: any) => {
      if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

      // Check if reaction already exists
      const [existing] = await db
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.messageId, ctx.params.id),
            eq(reactions.userId, ctx.user.id),
            eq(reactions.emoji, ctx.body.emoji),
          ),
        )
        .limit(1);

      if (existing) {
        return existing;
      }

      const [reaction] = await db
        .insert(reactions)
        .values({
          messageId: ctx.params.id,
          userId: ctx.user.id,
          emoji: ctx.body.emoji,
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
  .delete("/:id/reactions/:emoji", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    await db
      .delete(reactions)
      .where(
        and(
          eq(reactions.messageId, ctx.params.id),
          eq(reactions.userId, ctx.user.id),
          eq(reactions.emoji, ctx.params.emoji),
        ),
      );

    return { success: true };
  });

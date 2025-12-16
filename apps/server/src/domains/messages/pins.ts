import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channels, messages } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";

/**
 * Pin/unpin messages and list pinned messages in a channel.
 */
export const messagePinRoutes = new Elysia({ prefix: "/pins" })
  .use(authMiddleware)
  .get(
    "/",
    async ({ user, query, set }) => {
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

      const pinnedMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.channelId, query.channelId))
        .orderBy(desc(messages.pinnedAt));

      return pinnedMessages.filter((msg) => msg.pinnedAt !== null);
    },
    {
      query: t.Object({
        channelId: t.String(),
      }),
    },
  )
  .post(
    "/:messageId",
    async ({ user, params, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, params.messageId))
        .limit(1);

      if (!message) {
        set.status = 404;
        return { message: "Message not found" };
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

      const [updated] = await db
        .update(messages)
        .set({ pinnedAt: new Date(), pinnedBy: user.id })
        .where(eq(messages.id, params.messageId))
        .returning();

      return updated;
    },
    {
      params: t.Object({
        messageId: t.String(),
      }),
    },
  )
  .delete(
    "/:messageId",
    async ({ user, params, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, params.messageId))
        .limit(1);

      if (!message) {
        set.status = 404;
        return { message: "Message not found" };
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

      const [updated] = await db
        .update(messages)
        .set({ pinnedAt: null, pinnedBy: null })
        .where(eq(messages.id, params.messageId))
        .returning();

      return updated;
    },
    {
      params: t.Object({
        messageId: t.String(),
      }),
    },
  );

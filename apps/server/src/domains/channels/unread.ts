import { and, count, eq, gt } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channelReadStatus, channels, messages } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";

/**
 * Handles unread message tracking and read status updates.
 */
export const channelUnreadRoutes = new Elysia()
  .use(authMiddleware)
  .post(
    "/channels/:id/read",
    async ({ user, params, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, params.id))
        .limit(1);

      if (!channel) {
        set.status = 404;
        return { message: "Channel not found" };
      }

      await requireOrganizationMembership(user.id, channel.organizationId);

      const [existing] = await db
        .select()
        .from(channelReadStatus)
        .where(
          and(
            eq(channelReadStatus.userId, user.id),
            eq(channelReadStatus.channelId, params.id),
          ),
        )
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(channelReadStatus)
          .set({
            lastReadAt: new Date(),
            lastReadMessageId: body.lastReadMessageId,
            updatedAt: new Date(),
          })
          .where(eq(channelReadStatus.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await db
        .insert(channelReadStatus)
        .values({
          userId: user.id,
          channelId: params.id,
          lastReadAt: new Date(),
          lastReadMessageId: body.lastReadMessageId,
        })
        .returning();

      return created;
    },
    {
      body: t.Object({
        lastReadMessageId: t.Optional(t.String()),
      }),
    },
  )
  .get("/channels/:id/unread", async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, params.id))
      .limit(1);

    if (!channel) {
      set.status = 404;
      return { message: "Channel not found" };
    }

    await requireOrganizationMembership(user.id, channel.organizationId);

    const [readStatus] = await db
      .select()
      .from(channelReadStatus)
      .where(
        and(
          eq(channelReadStatus.userId, user.id),
          eq(channelReadStatus.channelId, params.id),
        ),
      )
      .limit(1);

    if (!readStatus) {
      const [result] = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.channelId, params.id));
      return { unreadCount: result?.count ?? 0 };
    }

    const [result] = await db
      .select({ count: count() })
      .from(messages)
      .where(
        and(
          eq(messages.channelId, params.id),
          gt(messages.createdAt, readStatus.lastReadAt),
        ),
      );

    return { unreadCount: result?.count ?? 0 };
  })
  .get("/organizations/:id/unread", async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    await requireOrganizationMembership(user.id, params.id);

    const orgChannels = await db
      .select()
      .from(channels)
      .where(eq(channels.organizationId, params.id));

    const unreadCounts = await Promise.all(
      orgChannels.map(async (channel) => {
        const [readStatus] = await db
          .select()
          .from(channelReadStatus)
          .where(
            and(
              eq(channelReadStatus.userId, user.id),
              eq(channelReadStatus.channelId, channel.id),
            ),
          )
          .limit(1);

        if (!readStatus) {
          const [result] = await db
            .select({ count: count() })
            .from(messages)
            .where(eq(messages.channelId, channel.id));
          return {
            channelId: channel.id,
            unreadCount: result?.count ?? 0,
          };
        }

        const [result] = await db
          .select({ count: count() })
          .from(messages)
          .where(
            and(
              eq(messages.channelId, channel.id),
              gt(messages.createdAt, readStatus.lastReadAt),
            ),
          );

        return {
          channelId: channel.id,
          unreadCount: result?.count ?? 0,
        };
      }),
    );

    return unreadCounts;
  });

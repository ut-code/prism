import { and, count, eq, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channelMembers, channels, users } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";

export const dmRoutes = new Elysia({ prefix: "/dms" })
  .use(authMiddleware)
  .get("/", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const dmChannelsList = await db
      .select({
        id: channels.id,
        name: channels.name,
        description: channels.description,
        type: channels.type,
        organizationId: channels.organizationId,
        createdAt: channels.createdAt,
        updatedAt: channels.updatedAt,
      })
      .from(channelMembers)
      .innerJoin(channels, eq(channelMembers.channelId, channels.id))
      .where(and(eq(channelMembers.userId, user.id), eq(channels.type, "dm")));

    return dmChannelsList;
  })
  .post(
    "/",
    async ({ user, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const { otherUserId, organizationId } = body;

      if (user.id === otherUserId) {
        set.status = 400;
        return { message: "Cannot create DM with yourself" };
      }

      const [otherUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, otherUserId))
        .limit(1);

      if (!otherUser) {
        set.status = 404;
        return { message: "User not found" };
      }

      const existingDMChannels = await db
        .select({
          channelId: channelMembers.channelId,
          memberCount: count(channelMembers.userId),
        })
        .from(channelMembers)
        .innerJoin(channels, eq(channelMembers.channelId, channels.id))
        .where(
          and(
            eq(channels.type, "dm"),
            eq(channels.organizationId, organizationId),
            or(
              eq(channelMembers.userId, user.id),
              eq(channelMembers.userId, otherUserId),
            ),
          ),
        )
        .groupBy(channelMembers.channelId);

      const existingChannel = existingDMChannels.find(
        (ch) => ch.memberCount === 2,
      );

      if (existingChannel) {
        const [channel] = await db
          .select()
          .from(channels)
          .where(eq(channels.id, existingChannel.channelId))
          .limit(1);

        if (channel) {
          return channel;
        }
      }

      const [newChannel] = await db
        .insert(channels)
        .values({
          name: `${user.name || user.email} & ${otherUser.name || otherUser.email}`,
          description: "Direct Message",
          type: "dm",
          organizationId,
        })
        .returning();

      if (!newChannel) {
        set.status = 500;
        return { message: "Failed to create DM channel" };
      }

      await db.insert(channelMembers).values([
        { channelId: newChannel.id, userId: user.id },
        { channelId: newChannel.id, userId: otherUserId },
      ]);

      set.status = 201;
      return newChannel;
    },
    {
      body: t.Object({
        otherUserId: t.String(),
        organizationId: t.String(),
      }),
    },
  );

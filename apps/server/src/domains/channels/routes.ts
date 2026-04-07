import { and, asc, count, eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channelMembers, channels } from "../../db/schema.ts";
import {
  BadRequestError,
  ForbiddenError,
  handleError,
  NotFoundError,
  UnauthorizedError,
} from "../../lib/errors.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { getOrganizationPermissions } from "../organizations/permissions.ts";

export const channelRoutes = new Elysia({ prefix: "/channels" })
  .use(authMiddleware)
  .get("/", async ({ user, query, set }) => {
    try {
      if (!user) throw new UnauthorizedError();
      if (!query.organizationId) {
        throw new BadRequestError(
          "organizationId is required",
          "MISSING_ORGANIZATION_ID",
        );
      }

      await getOrganizationPermissions(user.id, query.organizationId);

      // Get channels with membership info and member counts
      const channelList = await db
        .select({
          id: channels.id,
          name: channels.name,
          description: channels.description,
          type: channels.type,
          organizationId: channels.organizationId,
          groupId: channels.groupId,
          createdAt: channels.createdAt,
          updatedAt: channels.updatedAt,
          memberCount: count(channelMembers.id),
          joined: sql<boolean>`bool_or(${channelMembers.userId} = ${user.id})`,
        })
        .from(channels)
        .leftJoin(channelMembers, eq(channels.id, channelMembers.channelId))
        .where(eq(channels.organizationId, query.organizationId))
        .groupBy(channels.id)
        .orderBy(asc(channels.name));

      // For default channels, everyone is considered joined
      return channelList.map((ch) => ({
        ...ch,
        joined: ch.type === "default" ? true : (ch.joined ?? false),
      }));
    } catch (error) {
      return handleError(error, set);
    }
  })
  .get("/:id", async ({ user, params, set }) => {
    try {
      if (!user) throw new UnauthorizedError();

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, params.id))
        .limit(1);

      if (!channel) throw new NotFoundError("Channel", "CHANNEL_NOT_FOUND");

      await getOrganizationPermissions(user.id, channel.organizationId);

      return channel;
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post(
    "/",
    async ({ user, body, set }) => {
      try {
        if (!user) throw new UnauthorizedError();

        const perms = await getOrganizationPermissions(
          user.id,
          body.organizationId,
        );

        if (!perms.canCreateChannels) {
          throw new ForbiddenError(
            "Insufficient permissions",
            "CANNOT_CREATE_CHANNEL",
          );
        }

        const [channel] = await db
          .insert(channels)
          .values({
            name: body.name,
            description: body.description,
            organizationId: body.organizationId,
            groupId: body.groupId ?? null,
          })
          .returning();

        return channel;
      } catch (error) {
        return handleError(error, set);
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        organizationId: t.String(),
        groupId: t.Optional(t.String()),
      }),
      query: t.Object({
        organizationId: t.Optional(t.String()),
      }),
    },
  )
  .patch(
    "/:id",
    async ({ user, params, body, set }) => {
      try {
        if (!user) throw new UnauthorizedError();

        const [channel] = await db
          .select()
          .from(channels)
          .where(eq(channels.id, params.id))
          .limit(1);

        if (!channel) throw new NotFoundError("Channel", "CHANNEL_NOT_FOUND");

        const perms = await getOrganizationPermissions(
          user.id,
          channel.organizationId,
        );
        if (!perms.canCreateChannels) {
          throw new ForbiddenError(
            "Insufficient permissions",
            "CANNOT_UPDATE_CHANNEL",
          );
        }

        const [updated] = await db
          .update(channels)
          .set({
            ...(body.name !== undefined && { name: body.name }),
            ...(body.description !== undefined && {
              description: body.description,
            }),
            updatedAt: new Date(),
          })
          .where(eq(channels.id, params.id))
          .returning();

        return updated;
      } catch (error) {
        return handleError(error, set);
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.Nullable(t.String())),
      }),
    },
  )
  .patch(
    "/:id/group",
    async ({ user, params, body, set }) => {
      try {
        if (!user) throw new UnauthorizedError();

        const [channel] = await db
          .select()
          .from(channels)
          .where(eq(channels.id, params.id))
          .limit(1);

        if (!channel) throw new NotFoundError("Channel", "CHANNEL_NOT_FOUND");

        const perms = await getOrganizationPermissions(
          user.id,
          channel.organizationId,
        );
        if (!perms.canCreateChannels) {
          throw new ForbiddenError(
            "Insufficient permissions",
            "CANNOT_UPDATE_CHANNEL",
          );
        }

        const [updated] = await db
          .update(channels)
          .set({ groupId: body.groupId, updatedAt: new Date() })
          .where(eq(channels.id, params.id))
          .returning();

        return updated;
      } catch (error) {
        return handleError(error, set);
      }
    },
    {
      body: t.Object({
        groupId: t.Nullable(t.String()),
      }),
    },
  )
  .delete("/:id", async ({ user, params, set }) => {
    try {
      if (!user) throw new UnauthorizedError();

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, params.id))
        .limit(1);

      if (!channel) throw new NotFoundError("Channel", "CHANNEL_NOT_FOUND");

      const perms = await getOrganizationPermissions(
        user.id,
        channel.organizationId,
      );
      if (!perms.canCreateChannels) {
        throw new ForbiddenError(
          "Insufficient permissions",
          "CANNOT_DELETE_CHANNEL",
        );
      }

      await db.delete(channels).where(eq(channels.id, params.id));

      return { success: true };
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post("/:id/join", async ({ user, params, set }) => {
    try {
      if (!user) throw new UnauthorizedError();

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, params.id))
        .limit(1);

      if (!channel) throw new NotFoundError("Channel", "CHANNEL_NOT_FOUND");

      await getOrganizationPermissions(user.id, channel.organizationId);

      // Only public channels can be joined freely
      if (channel.type !== "public") {
        throw new ForbiddenError(
          "Only public channels can be joined",
          "CANNOT_JOIN_CHANNEL",
        );
      }

      // Check if already a member (idempotent)
      const [existing] = await db
        .select()
        .from(channelMembers)
        .where(
          and(
            eq(channelMembers.channelId, params.id),
            eq(channelMembers.userId, user.id),
          ),
        )
        .limit(1);

      if (!existing) {
        await db.insert(channelMembers).values({
          channelId: params.id,
          userId: user.id,
        });
      }

      return { success: true };
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post("/:id/leave", async ({ user, params, set }) => {
    try {
      if (!user) throw new UnauthorizedError();

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, params.id))
        .limit(1);

      if (!channel) throw new NotFoundError("Channel", "CHANNEL_NOT_FOUND");

      await getOrganizationPermissions(user.id, channel.organizationId);

      // Cannot leave default channels
      if (channel.type === "default") {
        throw new ForbiddenError(
          "Cannot leave default channels",
          "CANNOT_LEAVE_CHANNEL",
        );
      }

      await db
        .delete(channelMembers)
        .where(
          and(
            eq(channelMembers.channelId, params.id),
            eq(channelMembers.userId, user.id),
          ),
        );

      return { success: true };
    } catch (error) {
      return handleError(error, set);
    }
  });

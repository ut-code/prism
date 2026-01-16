import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channels } from "../../db/schema.ts";
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

      const channelList = await db
        .select()
        .from(channels)
        .where(eq(channels.organizationId, query.organizationId))
        .orderBy(desc(channels.createdAt));

      return channelList;
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
  );

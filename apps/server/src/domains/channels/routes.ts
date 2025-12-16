import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channels } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { getOrganizationPermissions } from "../organizations/permissions.ts";
import { channelUnreadRoutes } from "./unread.ts";

export const channelRoutes = new Elysia({ prefix: "/channels" })
  .use(authMiddleware)
  .use(channelUnreadRoutes)
  .get("/", async ({ user, query, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
    if (!query.organizationId) {
      set.status = 400;
      return { message: "organizationId is required" };
    }

    await getOrganizationPermissions(user.id, query.organizationId);

    const channelList = await db
      .select()
      .from(channels)
      .where(eq(channels.organizationId, query.organizationId))
      .orderBy(desc(channels.createdAt));

    return channelList;
  })
  .get("/:id", async ({ user, params, set }) => {
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

    await getOrganizationPermissions(user.id, channel.organizationId);

    return channel;
  })
  .post(
    "/",
    async ({ user, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const perms = await getOrganizationPermissions(
        user.id,
        body.organizationId,
      );

      if (!perms.canCreateChannels) {
        set.status = 403;
        return { message: "Insufficient permissions" };
      }

      const [channel] = await db
        .insert(channels)
        .values({
          name: body.name,
          description: body.description,
          organizationId: body.organizationId,
        })
        .returning();

      return channel;
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        organizationId: t.String(),
      }),
      query: t.Object({
        organizationId: t.Optional(t.String()),
      }),
    },
  );

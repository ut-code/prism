import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { channels } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";
import { getOrganizationPermissions } from "../organizations/permissions";

export const channelRoutes = new Elysia({ prefix: "/channels" })
  .use(authMiddleware)
  .get("/", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });
    if (!ctx.query.organizationId)
      return ctx.error(400, { message: "organizationId is required" });

    await getOrganizationPermissions(ctx.user.id, ctx.query.organizationId);

    const channelList = await db
      .select()
      .from(channels)
      .where(eq(channels.organizationId, ctx.query.organizationId))
      .orderBy(desc(channels.createdAt));

    return channelList;
  })
  .get("/:id", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, ctx.params.id))
      .limit(1);

    if (!channel) {
      return ctx.error(404, { message: "Channel not found" });
    }

    await getOrganizationPermissions(ctx.user.id, channel.organizationId);

    return channel;
  })
  .post(
    "/",
    async (ctx: any) => {
      if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

      const perms = await getOrganizationPermissions(
        ctx.user.id,
        ctx.body.organizationId,
      );

      if (!perms.canCreateChannels) {
        return ctx.error(403, { message: "Insufficient permissions" });
      }

      const [channel] = await db
        .insert(channels)
        .values({
          name: ctx.body.name,
          description: ctx.body.description,
          organizationId: ctx.body.organizationId,
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

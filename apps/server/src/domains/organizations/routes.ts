import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { organizationMembers, organizations, users } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";
import { getOrganizationPermissions } from "./permissions";

export const organizationRoutes = new Elysia({ prefix: "/organizations" })
  .use(authMiddleware)
  .get("/", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    const memberships = await db
      .select({
        organization: organizations,
        membership: organizationMembers,
      })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .where(eq(organizationMembers.userId, ctx.user.id));

    return memberships.map((m) => ({
      ...m.organization,
      permission: m.membership.permission,
      role: m.membership.role,
    }));
  })
  .get("/:id", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    const perms = await getOrganizationPermissions(ctx.user.id, ctx.params.id);

    return {
      ...perms.organization,
      permission: perms.membership.permission,
      role: perms.membership.role,
    };
  })
  .post(
    "/",
    async (ctx: any) => {
      if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

      const [org] = await db
        .insert(organizations)
        .values({
          name: ctx.body.name,
          description: ctx.body.description,
          ownerId: ctx.user.id,
        })
        .returning();

      if (org) {
        await db.insert(organizationMembers).values({
          organizationId: org.id,
          userId: ctx.user.id,
          permission: "admin",
        });
      }

      return org;
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
      }),
    },
  )
  .patch(
    "/:id",
    async (ctx: any) => {
      if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

      const perms = await getOrganizationPermissions(
        ctx.user.id,
        ctx.params.id,
      );

      if (!perms.canUpdate) {
        return ctx.error(403, { message: "Insufficient permissions" });
      }

      const [updated] = await db
        .update(organizations)
        .set({
          name: ctx.body.name,
          description: ctx.body.description,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, ctx.params.id))
        .returning();

      return updated;
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.String()),
      }),
    },
  )
  .get("/:id/members", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    await getOrganizationPermissions(ctx.user.id, ctx.params.id);

    const members = await db
      .select({
        membership: organizationMembers,
        user: users,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, ctx.params.id));

    return members.map((m) => ({
      ...m.membership,
      user: m.user,
    }));
  })
  .post(
    "/:id/members",
    async (ctx: any) => {
      if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

      const perms = await getOrganizationPermissions(
        ctx.user.id,
        ctx.params.id,
      );

      if (!perms.canInviteMembers) {
        return ctx.error(403, { message: "Insufficient permissions" });
      }

      // Check if user exists
      const [targetUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.body.userId))
        .limit(1);

      if (!targetUser) {
        return ctx.error(404, { message: "User not found" });
      }

      // Check if already a member
      const [existing] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, ctx.params.id),
            eq(organizationMembers.userId, ctx.body.userId),
          ),
        )
        .limit(1);

      if (existing) {
        return ctx.error(400, { message: "User is already a member" });
      }

      const [membership] = await db
        .insert(organizationMembers)
        .values({
          organizationId: ctx.params.id,
          userId: ctx.body.userId,
          role: ctx.body.role,
          permission: ctx.body.permission,
        })
        .returning();

      return membership;
    },
    {
      body: t.Object({
        userId: t.String(),
        role: t.Optional(t.String()),
        permission: t.Union([
          t.Literal("admin"),
          t.Literal("member"),
          t.Literal("visitor"),
        ]),
      }),
    },
  )
  .delete("/:id/members/:userId", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    const perms = await getOrganizationPermissions(ctx.user.id, ctx.params.id);

    if (!perms.canRemoveMembers) {
      return ctx.error(403, { message: "Insufficient permissions" });
    }

    if (ctx.params.userId === ctx.user.id) {
      return ctx.error(400, { message: "Cannot remove yourself" });
    }

    await db
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, ctx.params.id),
          eq(organizationMembers.userId, ctx.params.userId),
        ),
      );

    return { success: true };
  });

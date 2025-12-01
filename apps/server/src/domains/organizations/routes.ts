import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { organizationMembers, organizations, users } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";
import { getOrganizationPermissions } from "./permissions";

export const organizationRoutes = new Elysia({ prefix: "/organizations" })
  .use(authMiddleware)
  .get("/", async ({ user, error }) => {
    if (!user) return error(401, { message: "Unauthorized" });

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
      .where(eq(organizationMembers.userId, user.id));

    return memberships.map((m) => ({
      ...m.organization,
      permission: m.membership.permission,
      role: m.membership.role,
    }));
  })
  .get("/:id", async ({ user, error, params }) => {
    if (!user) return error(401, { message: "Unauthorized" });

    const perms = await getOrganizationPermissions(user.id, params.id);

    return {
      ...perms.organization,
      permission: perms.membership.permission,
      role: perms.membership.role,
    };
  })
  .post(
    "/",
    async ({ user, error, body }) => {
      if (!user) return error(401, { message: "Unauthorized" });

      const [org] = await db
        .insert(organizations)
        .values({
          name: body.name,
          description: body.description,
          ownerId: user.id,
        })
        .returning();

      await db.insert(organizationMembers).values({
        organizationId: org.id,
        userId: user.id,
        permission: "admin",
      });

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
    async ({ user, error, params, body }) => {
      if (!user) return error(401, { message: "Unauthorized" });

      const perms = await getOrganizationPermissions(user.id, params.id);

      if (!perms.canUpdate) {
        return error(403, { message: "Insufficient permissions" });
      }

      const [updated] = await db
        .update(organizations)
        .set({
          name: body.name,
          description: body.description,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, params.id))
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
  .get("/:id/members", async ({ user, error, params }) => {
    if (!user) return error(401, { message: "Unauthorized" });

    await getOrganizationPermissions(user.id, params.id);

    const members = await db
      .select({
        membership: organizationMembers,
        user: users,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, params.id));

    return members.map((m) => ({
      ...m.membership,
      user: m.user,
    }));
  })
  .post(
    "/:id/members",
    async ({ user, error, params, body }) => {
      if (!user) return error(401, { message: "Unauthorized" });

      const perms = await getOrganizationPermissions(user.id, params.id);

      if (!perms.canInviteMembers) {
        return error(403, { message: "Insufficient permissions" });
      }

      // Check if user exists
      const [targetUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, body.userId))
        .limit(1);

      if (!targetUser) {
        return error(404, { message: "User not found" });
      }

      // Check if already a member
      const [existing] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, params.id),
            eq(organizationMembers.userId, body.userId),
          ),
        )
        .limit(1);

      if (existing) {
        return error(400, { message: "User is already a member" });
      }

      const [membership] = await db
        .insert(organizationMembers)
        .values({
          organizationId: params.id,
          userId: body.userId,
          role: body.role,
          permission: body.permission,
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
  .delete("/:id/members/:userId", async ({ user, error, params }) => {
    if (!user) return error(401, { message: "Unauthorized" });

    const perms = await getOrganizationPermissions(user.id, params.id);

    if (!perms.canRemoveMembers) {
      return error(403, { message: "Insufficient permissions" });
    }

    if (params.userId === user.id) {
      return error(400, { message: "Cannot remove yourself" });
    }

    await db
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, params.id),
          eq(organizationMembers.userId, params.userId),
        ),
      );

    return { success: true };
  });

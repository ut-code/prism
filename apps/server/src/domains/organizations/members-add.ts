import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { organizationMembers, users } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { getOrganizationPermissions } from "./permissions.ts";

/**
 * Organization member addition route
 * Handles: add member to organization
 */
export const organizationMemberAddRoute = new Elysia().use(authMiddleware).post(
  "/:id/members",
  async ({ user, body, params, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const perms = await getOrganizationPermissions(user.id, params.id);

    if (!perms.canInviteMembers) {
      set.status = 403;
      return { message: "Insufficient permissions" };
    }

    // Check if user exists
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, body.userId))
      .limit(1);

    if (!targetUser) {
      set.status = 404;
      return { message: "User not found" };
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
      set.status = 400;
      return { message: "User is already a member" };
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
);

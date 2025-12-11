import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { organizationMembers, users } from "../../db/schema";
import type { AuthUser } from "../../middleware/auth";
import { getOrganizationPermissions } from "./permissions";

/**
 * Organization member addition route
 * Handles: add member to organization
 */
export const organizationMemberAddRoute = new Elysia()
  .post(
    "/:id/members",
    async ({ user, body, params, set }: {
      user: AuthUser | null;
      body: { userId: string; role?: string; permission: "admin" | "member" | "visitor" };
      params: { id: string };
      set: any;
    }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const perms = await getOrganizationPermissions(
        user.id,
        params.id,
      );

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

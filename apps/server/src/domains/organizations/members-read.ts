import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "../../db";
import { organizationMembers, users } from "../../db/schema";
import type { AuthUser } from "../../middleware/auth";
import { getOrganizationPermissions } from "./permissions";

/**
 * Organization member read routes
 * Handles: list members
 */
export const organizationMemberReadRoutes = new Elysia()
  .get("/:id/members", async ({ user, params, set }: { user: AuthUser | null; params: { id: string }; set: any }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

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
  });

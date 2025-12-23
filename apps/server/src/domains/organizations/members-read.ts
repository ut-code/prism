import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "../../db/index.ts";
import { organizationMembers, users } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { getOrganizationPermissions } from "./permissions.ts";

/**
 * Organization member read routes
 * Handles: list members
 */
export const organizationMemberReadRoutes = new Elysia()
  .use(authMiddleware)
  .get("/:id/members", async ({ user, params, set }) => {
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

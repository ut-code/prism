import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "../../db/index.ts";
import { organizationMembers, organizations } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { getOrganizationPermissions } from "./permissions.ts";

/**
 * Organization read routes
 * Handles: list organizations, get organization by ID
 */
export const organizationReadRoutes = new Elysia()
  .use(authMiddleware)
  .get("/", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

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
  .get("/:id", async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const perms = await getOrganizationPermissions(user.id, params.id);

    return {
      ...perms.organization,
      permission: perms.membership.permission,
      role: perms.membership.role,
    };
  });

import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "../../db/index.ts";
import { organizationMembers } from "../../db/schema.ts";
import type { AuthUser } from "../../middleware/auth.ts";
import { getOrganizationPermissions } from "./permissions.ts";

/**
 * Organization member removal route
 * Handles: remove member from organization
 */
export const organizationMemberRemoveRoute = new Elysia().delete(
  "/:id/members/:userId",
  async ({
    user,
    params,
    set,
  }: {
    user: AuthUser | null;
    params: { id: string; userId: string };
    set: any;
  }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const perms = await getOrganizationPermissions(user.id, params.id);

    if (!perms.canRemoveMembers) {
      set.status = 403;
      return { message: "Insufficient permissions" };
    }

    if (params.userId === user.id) {
      set.status = 400;
      return { message: "Cannot remove yourself" };
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
  },
);

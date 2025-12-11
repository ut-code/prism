import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { organizationMembers, organizations } from "../../db/schema";
import type { AuthUser } from "../../middleware/auth";
import { getOrganizationPermissions } from "./permissions";

/**
 * Organization write routes
 * Handles: create organization, update organization
 */
export const organizationWriteRoutes = new Elysia()
  .post(
    "/",
    async ({ user, body, set }: { user: AuthUser | null; body: { name: string; description?: string }; set: any }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const [org] = await db
        .insert(organizations)
        .values({
          name: body.name,
          description: body.description,
          ownerId: user.id,
        })
        .returning();

      if (org) {
        await db.insert(organizationMembers).values({
          organizationId: org.id,
          userId: user.id,
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
    async ({ user, body, params, set }: {
      user: AuthUser | null;
      body: { name?: string; description?: string };
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

      if (!perms.canUpdate) {
        set.status = 403;
        return { message: "Insufficient permissions" };
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
  );

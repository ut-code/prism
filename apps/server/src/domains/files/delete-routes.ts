import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "../../db/index.ts";
import { files } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";

/**
 * Handles file deletion operations (DELETE).
 */
export const fileDeleteRoutes = new Elysia()
  .use(authMiddleware)
  .delete("/:id", async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, params.id))
      .limit(1);

    if (!file) {
      set.status = 404;
      return { message: "File not found" };
    }

    const membership = await requireOrganizationMembership(
      user.id,
      file.organizationId,
    );

    if (file.uploadedBy !== user.id && membership.permission !== "admin") {
      set.status = 403;
      return { message: "Insufficient permissions" };
    }

    await db.delete(files).where(eq(files.id, params.id));

    return { success: true };
  });

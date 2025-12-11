import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { files } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";
import { requireOrganizationMembership } from "../organizations/permissions";

/**
 * Handles file read operations (GET, LIST).
 */
export const fileReadRoutes = new Elysia()
  .use(authMiddleware)
  .get("/:id", async ({ user, params, set }) => {
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

    await requireOrganizationMembership(user.id, file.organizationId);

    return file;
  })
  .get("/", async ({ user, query, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
    if (!query.organizationId) {
      set.status = 400;
      return { message: "organizationId is required" };
    }

    await requireOrganizationMembership(user.id, query.organizationId);

    const limit = query.limit ? Math.min(Number(query.limit), 100) : 50;

    const fileList = await db
      .select()
      .from(files)
      .where(eq(files.organizationId, query.organizationId))
      .orderBy(desc(files.uploadedAt))
      .limit(limit);

    return fileList;
  });

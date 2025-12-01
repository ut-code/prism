import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { files } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";
import { requireOrganizationMembership } from "../organizations/permissions";

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/json",
  "text/csv",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const fileRoutes = new Elysia({ prefix: "/files" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ user, error, body }) => {
      if (!user) return error(401, { message: "Unauthorized" });

      await requireOrganizationMembership(user.id, body.organizationId);

      if (body.size > MAX_FILE_SIZE) {
        return error(400, {
          message: "File size exceeds limit (max 10MB)",
        });
      }

      if (!ALLOWED_MIME_TYPES.includes(body.mimeType)) {
        return error(400, { message: "Unsupported file type" });
      }

      const sanitizedFilename = body.filename
        .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF._-]/g, "_")
        .substring(0, 255);

      const [file] = await db
        .insert(files)
        .values({
          storageId: body.storageId,
          filename: sanitizedFilename,
          originalFilename: body.originalFilename,
          mimeType: body.mimeType,
          size: body.size,
          uploadedBy: user.id,
          organizationId: body.organizationId,
          width: body.width,
          height: body.height,
        })
        .returning();

      return file;
    },
    {
      body: t.Object({
        storageId: t.String(),
        filename: t.String(),
        originalFilename: t.String(),
        mimeType: t.String(),
        size: t.Number(),
        organizationId: t.String(),
        width: t.Optional(t.Number()),
        height: t.Optional(t.Number()),
      }),
    },
  )
  .get("/:id", async ({ user, error, params }) => {
    if (!user) return error(401, { message: "Unauthorized" });

    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, params.id))
      .limit(1);

    if (!file) {
      return error(404, { message: "File not found" });
    }

    await requireOrganizationMembership(user.id, file.organizationId);

    return file;
  })
  .get("/", async ({ user, error, query }) => {
    if (!user) return error(401, { message: "Unauthorized" });
    if (!query.organizationId)
      return error(400, { message: "organizationId is required" });

    await requireOrganizationMembership(user.id, query.organizationId);

    const limit = query.limit ? Math.min(Number(query.limit), 100) : 50;

    const fileList = await db
      .select()
      .from(files)
      .where(eq(files.organizationId, query.organizationId))
      .orderBy(desc(files.uploadedAt))
      .limit(limit);

    return fileList;
  })
  .delete("/:id", async ({ user, error, params }) => {
    if (!user) return error(401, { message: "Unauthorized" });

    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, params.id))
      .limit(1);

    if (!file) {
      return error(404, { message: "File not found" });
    }

    const membership = await requireOrganizationMembership(
      user.id,
      file.organizationId,
    );

    if (file.uploadedBy !== user.id && membership.permission !== "admin") {
      return error(403, { message: "Insufficient permissions" });
    }

    await db.delete(files).where(eq(files.id, params.id));

    return { success: true };
  });

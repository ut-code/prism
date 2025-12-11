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
    async (ctx: any) => {
      if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

      await requireOrganizationMembership(ctx.user.id, ctx.body.organizationId);

      if (ctx.body.size > MAX_FILE_SIZE) {
        return ctx.error(400, {
          message: "File size exceeds limit (max 10MB)",
        });
      }

      if (!ALLOWED_MIME_TYPES.includes(ctx.body.mimeType)) {
        return ctx.error(400, { message: "Unsupported file type" });
      }

      const sanitizedFilename = ctx.body.filename
        .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF._-]/g, "_")
        .substring(0, 255);

      const [file] = await db
        .insert(files)
        .values({
          storageId: ctx.body.storageId,
          filename: sanitizedFilename,
          originalFilename: ctx.body.originalFilename,
          mimeType: ctx.body.mimeType,
          size: ctx.body.size,
          uploadedBy: ctx.user.id,
          organizationId: ctx.body.organizationId,
          width: ctx.body.width,
          height: ctx.body.height,
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
  .get("/:id", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, ctx.params.id))
      .limit(1);

    if (!file) {
      return ctx.error(404, { message: "File not found" });
    }

    await requireOrganizationMembership(ctx.user.id, file.organizationId);

    return file;
  })
  .get("/", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });
    if (!ctx.query.organizationId)
      return ctx.error(400, { message: "organizationId is required" });

    await requireOrganizationMembership(ctx.user.id, ctx.query.organizationId);

    const limit = ctx.query.limit ? Math.min(Number(ctx.query.limit), 100) : 50;

    const fileList = await db
      .select()
      .from(files)
      .where(eq(files.organizationId, ctx.query.organizationId))
      .orderBy(desc(files.uploadedAt))
      .limit(limit);

    return fileList;
  })
  .delete("/:id", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, ctx.params.id))
      .limit(1);

    if (!file) {
      return ctx.error(404, { message: "File not found" });
    }

    const membership = await requireOrganizationMembership(
      ctx.user.id,
      file.organizationId,
    );

    if (file.uploadedBy !== ctx.user.id && membership.permission !== "admin") {
      return ctx.error(403, { message: "Insufficient permissions" });
    }

    await db.delete(files).where(eq(files.id, ctx.params.id));

    return { success: true };
  });

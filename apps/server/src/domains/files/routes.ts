import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { files } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";
import { fileDeleteRoutes } from "./delete-routes.ts";
import { fileReadRoutes } from "./read-routes.ts";
import { sanitizeFilename, validateFile } from "./validation.ts";

/**
 * Handles file-related operations.
 * Provides endpoints to upload, retrieve, list, and delete files.
 */
export const fileRoutes = new Elysia({ prefix: "/files" })
  .use(authMiddleware)
  .use(fileReadRoutes)
  .use(fileDeleteRoutes)
  .post(
    "/",
    async ({ user, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      await requireOrganizationMembership(user.id, body.organizationId);

      const validationError = validateFile(body.size, body.mimeType);
      if (validationError) {
        set.status = 400;
        return { message: validationError };
      }

      const sanitizedFilename = sanitizeFilename(body.filename);

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
  );

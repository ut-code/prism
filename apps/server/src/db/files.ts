import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { organizations } from "./organizations";

// Files
export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storageId: text("storage_id").notNull(),
    filename: text("filename").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    width: integer("width"),
    height: integer("height"),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  },
  (table) => [
    index("files_org_idx").on(table.organizationId),
    index("files_uploader_idx").on(table.uploadedBy),
  ],
);

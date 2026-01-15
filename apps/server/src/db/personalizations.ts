import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth.ts";
import { organizations } from "./organizations.ts";

// Personalization
export const personalizations = pgTable(
  "personalizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    nickname: text("nickname").notNull(),
    icon: text("icon"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("personalizations_user_idx").on(table.userId),
    index("personalizations_org_idx").on(table.organizationId),
    index("personalizations_user_org_idx").on(
      table.userId,
      table.organizationId,
    ),
  ],
);

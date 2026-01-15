import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { channels } from "./channels.ts";
import { organizations } from "./organizations.ts";

// Channel Groups
export const channelGroups = pgTable(
  "channel_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    parentGroupId: uuid("parent_group_id").references(
      (): AnyPgColumn => channelGroups.id,
      { onDelete: "set null" },
    ),
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("channel_groups_org_idx").on(table.organizationId),
    index("channel_groups_parent_idx").on(table.parentGroupId),
  ],
);

// Relations
export const channelGroupsRelations = relations(
  channelGroups,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [channelGroups.organizationId],
      references: [organizations.id],
    }),
    parentGroup: one(channelGroups, {
      fields: [channelGroups.parentGroupId],
      references: [channelGroups.id],
      relationName: "parentChild",
    }),
    childGroups: many(channelGroups, { relationName: "parentChild" }),
    channels: many(channels),
  }),
);

import { relations } from "drizzle-orm";
import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth.ts";
import { channels } from "./channels.ts";
import { messages } from "./messages.ts";

/**
 * Tracks when users last read each channel.
 * Used for calculating unread message counts.
 */
export const channelReadStatus = pgTable(
  "channel_read_status",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    channelId: uuid("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at").notNull().defaultNow(),
    lastReadMessageId: uuid("last_read_message_id").references(
      () => messages.id,
      { onDelete: "set null" },
    ),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("channel_read_status_user_idx").on(table.userId),
    index("channel_read_status_channel_idx").on(table.channelId),
    index("channel_read_status_user_channel_idx").on(
      table.userId,
      table.channelId,
    ),
  ],
);

export const channelReadStatusRelations = relations(
  channelReadStatus,
  ({ one }) => ({
    user: one(users, {
      fields: [channelReadStatus.userId],
      references: [users.id],
    }),
    channel: one(channels, {
      fields: [channelReadStatus.channelId],
      references: [channels.id],
    }),
    lastReadMessage: one(messages, {
      fields: [channelReadStatus.lastReadMessageId],
      references: [messages.id],
    }),
  }),
);

import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth.ts";
import { channels } from "./channels.ts";
import { files } from "./files.ts";
import { votes } from "./votes.ts";

// Messages - self-referencing table
// Using AnyPgColumn to avoid circular type inference errors
// See: https://github.com/drizzle-team/drizzle-orm/issues/2476
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channelId: uuid("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    author: text("author").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): AnyPgColumn => messages.id, {
      onDelete: "set null",
    }),
    voteId: uuid("vote_id").references(() => votes.id, {
      onDelete: "set null",
    }),
    pinnedAt: timestamp("pinned_at"),
    pinnedBy: uuid("pinned_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    editedAt: timestamp("edited_at"),
  },
  (table) => [index("messages_channel_idx").on(table.channelId)],
);

// Message attachments (junction table)
export const messageAttachments = pgTable("message_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  fileId: uuid("file_id")
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),
});

// Reactions
export const reactions = pgTable(
  "reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    emoji: text("emoji").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("reactions_message_idx").on(table.messageId),
    index("reactions_user_idx").on(table.userId),
  ],
);

// Relations
export const messagesRelations = relations(messages, ({ one, many }) => ({
  channel: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  parent: one(messages, {
    fields: [messages.parentId],
    references: [messages.id],
  }),
  vote: one(votes, {
    fields: [messages.voteId],
    references: [votes.id],
  }),
  reactions: many(reactions),
  attachments: many(messageAttachments),
  replies: many(messages),
}));

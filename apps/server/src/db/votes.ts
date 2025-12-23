import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Votes
export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  maxVotes: integer("max_votes").notNull(),
  voteOptions: jsonb("vote_options").notNull().$type<string[]>(),
  voters: jsonb("voters")
    .notNull()
    .$type<Array<{ userId: string; votedOptions: number[] }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

import { and, asc, eq, ilike } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channels, messages, users } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";

/**
 * Escapes special characters in LIKE pattern (%, _, \).
 * Prevents SQL injection by treating user input as literal text.
 */
export function escapeLikePattern(pattern: string): string {
  return pattern
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

/**
 * Handles message search operations.
 * Provides endpoint to search messages within a channel.
 */
export const messageSearchRoutes = new Elysia().use(authMiddleware).get(
  "/search",
  async ({ user, query, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
    if (!query.q || !query.channelId) {
      set.status = 400;
      return { message: "q and channelId are required" };
    }

    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, query.channelId))
      .limit(1);

    if (!channel) {
      set.status = 404;
      return { message: "Channel not found" };
    }

    await requireOrganizationMembership(user.id, channel.organizationId);

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const results = await db
      .select({
        message: messages,
        user: users,
        channel: channels,
      })
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .leftJoin(channels, eq(messages.channelId, channels.id))
      .where(
        and(
          eq(messages.channelId, query.channelId),
          ilike(messages.content, `%${escapeLikePattern(query.q)}%`),
        ),
      )
      .orderBy(asc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return results;
  },
  {
    query: t.Object({
      q: t.String(),
      channelId: t.String(),
      limit: t.Optional(t.Number()),
      offset: t.Optional(t.Number()),
    }),
  },
);

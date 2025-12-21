import { asc, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "../../db/index.ts";
import { channels, messages } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";

/**
 * Handles listing messages in a channel.
 */
export const messageListRoutes = new Elysia()
  .use(authMiddleware)
  .get("/", async ({ user, query, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
    if (!query.channelId) {
      set.status = 400;
      return { message: "channelId is required" };
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

    const messageList = await db
      .select()
      .from(messages)
      .where(eq(messages.channelId, query.channelId))
      .orderBy(asc(messages.createdAt));

    return messageList;
  });

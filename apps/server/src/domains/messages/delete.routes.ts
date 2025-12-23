import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channels, messages } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { wsManager } from "../../ws/manager.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";

/**
 * Handles deleting messages.
 */
export const messageDeleteRoutes = new Elysia().use(authMiddleware).delete(
  "/:id",
  async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, params.id))
      .limit(1);

    if (!message) {
      set.status = 404;
      return { message: "Message not found" };
    }

    if (message.userId !== user.id) {
      set.status = 403;
      return { message: "Forbidden: You can only delete your own messages" };
    }

    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, message.channelId))
      .limit(1);

    if (!channel) {
      set.status = 404;
      return { message: "Channel not found" };
    }

    await requireOrganizationMembership(user.id, channel.organizationId);

    await db.delete(messages).where(eq(messages.id, params.id));

    wsManager.broadcast(message.channelId, {
      type: "message:deleted",
      channelId: message.channelId,
      messageId: params.id,
    });

    return { success: true };
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  },
);

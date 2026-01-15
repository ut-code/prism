import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channels, messages } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { wsManager } from "../../ws/manager.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";

/**
 * Handles updating existing messages.
 */
export const messageUpdateRoutes = new Elysia().use(authMiddleware).put(
  "/:id",
  async ({ user, params, body, set }) => {
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
      return { message: "Forbidden: You can only edit your own messages" };
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

    const [updatedMessage] = await db
      .update(messages)
      .set({
        content: body.content,
        editedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(messages.id, params.id))
      .returning();

    if (!updatedMessage) {
      set.status = 500;
      return { message: "Failed to update message" };
    }

    wsManager.broadcast(message.channelId, {
      type: "message:updated",
      channelId: message.channelId,
      messageId: params.id,
      message: updatedMessage,
    });

    return updatedMessage;
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      content: t.String(),
    }),
  },
);

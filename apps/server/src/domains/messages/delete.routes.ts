import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { channels, messages } from "../../db/schema.ts";
import {
  ForbiddenError,
  handleError,
  NotFoundError,
  UnauthorizedError,
} from "../../lib/errors.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { wsManager } from "../../ws/manager.ts";
import { requireOrganizationMembership } from "../organizations/permissions.ts";

/**
 * Handles deleting messages.
 */
export const messageDeleteRoutes = new Elysia().use(authMiddleware).delete(
  "/:id",
  async ({ user, params, set }) => {
    try {
      if (!user) throw new UnauthorizedError();

      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, params.id))
        .limit(1);

      if (!message) throw new NotFoundError("Message", "MESSAGE_NOT_FOUND");

      if (message.userId !== user.id) {
        throw new ForbiddenError(
          "You can only delete your own messages",
          "CANNOT_DELETE_MESSAGE",
        );
      }

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, message.channelId))
        .limit(1);

      if (!channel) throw new NotFoundError("Channel", "CHANNEL_NOT_FOUND");

      await requireOrganizationMembership(user.id, channel.organizationId);

      await db.delete(messages).where(eq(messages.id, params.id));

      wsManager.broadcast(message.channelId, {
        type: "message:deleted",
        channelId: message.channelId,
        messageId: params.id,
      });

      return { success: true };
    } catch (error) {
      return handleError(error, set);
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  },
);

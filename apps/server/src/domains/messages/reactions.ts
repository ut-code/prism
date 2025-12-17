import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { messages, reactions } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { wsManager } from "../../ws/manager.ts";

/**
 * Handles reaction-related operations for messages.
 * Provides endpoints to list, create, and delete reactions on messages.
 */
export const messageReactionRoutes = new Elysia()
  .use(authMiddleware)
  .get("/:id/reactions", async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const reactionList = await db
      .select()
      .from(reactions)
      .where(eq(reactions.messageId, params.id));

    return reactionList;
  })
  .post(
    "/:id/reactions",
    async ({ user, params, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      // Check if reaction already exists
      const [existing] = await db
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.messageId, params.id),
            eq(reactions.userId, user.id),
            eq(reactions.emoji, body.emoji),
          ),
        )
        .limit(1);

      if (existing) {
        return existing;
      }

      const [reaction] = await db
        .insert(reactions)
        .values({
          messageId: params.id,
          userId: user.id,
          emoji: body.emoji,
        })
        .returning();

      // Broadcast reaction:added event
      const [message] = await db
        .select({ channelId: messages.channelId })
        .from(messages)
        .where(eq(messages.id, params.id))
        .limit(1);

      if (message) {
        wsManager.broadcast(message.channelId, {
          type: "reaction:added",
          channelId: message.channelId,
          messageId: params.id,
          reaction,
        });
      }

      return reaction;
    },
    {
      body: t.Object({
        emoji: t.String(),
      }),
    },
  )
  .delete("/:id/reactions/:emoji", async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    await db
      .delete(reactions)
      .where(
        and(
          eq(reactions.messageId, params.id),
          eq(reactions.userId, user.id),
          eq(reactions.emoji, params.emoji),
        ),
      );

    // Broadcast reaction:removed event
    const [message] = await db
      .select({ channelId: messages.channelId })
      .from(messages)
      .where(eq(messages.id, params.id))
      .limit(1);

    if (message) {
      wsManager.broadcast(message.channelId, {
        type: "reaction:removed",
        channelId: message.channelId,
        messageId: params.id,
        emoji: params.emoji,
        userId: user.id,
      });
    }

    return { success: true };
  });

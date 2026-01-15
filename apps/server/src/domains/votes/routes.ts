import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { votes } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";

export const voteRoutes = new Elysia({ prefix: "/votes" })
  .use(authMiddleware)
  .get("/:id", async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const [vote] = await db
      .select()
      .from(votes)
      .where(eq(votes.id, params.id))
      .limit(1);

    if (!vote) {
      set.status = 404;
      return { message: "Vote not found" };
    }

    return vote;
  })
  .post(
    "/",
    async ({ user, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const [vote] = await db
        .insert(votes)
        .values({
          title: body.title,
          maxVotes: body.maxVotes,
          voteOptions: body.voteOptions,
          voters: [],
        })
        .returning();

      return vote;
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 200 }),
        maxVotes: t.Number({ minimum: 1 }),
        voteOptions: t.Array(t.String({ minLength: 1 }), {
          minItems: 2,
          maxItems: 20,
        }),
      }),
    },
  )
  .post(
    "/:id/cast",
    async ({ user, params, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const [vote] = await db
        .select()
        .from(votes)
        .where(eq(votes.id, params.id))
        .limit(1);

      if (!vote) {
        set.status = 404;
        return { message: "Vote not found" };
      }

      // Validate votedOptions indices are within bounds
      const invalidIndices = body.votedOptions.filter(
        (index) => index < 0 || index >= vote.voteOptions.length,
      );
      if (invalidIndices.length > 0) {
        set.status = 400;
        return { message: "Invalid vote option indices" };
      }

      // Check if user already voted
      const existingVoterIndex = vote.voters.findIndex(
        (v) => v.userId === user.id,
      );

      const newVoters = [...vote.voters];

      if (existingVoterIndex >= 0) {
        // Update existing vote
        newVoters[existingVoterIndex] = {
          userId: user.id,
          votedOptions: body.votedOptions,
        };
      } else {
        // Add new vote
        newVoters.push({
          userId: user.id,
          votedOptions: body.votedOptions,
        });
      }

      const [updatedVote] = await db
        .update(votes)
        .set({ voters: newVoters, updatedAt: new Date() })
        .where(eq(votes.id, params.id))
        .returning();

      return updatedVote;
    },
    {
      body: t.Object({
        votedOptions: t.Array(t.Number()),
      }),
    },
  );

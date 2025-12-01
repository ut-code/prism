import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { votes } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";

export const voteRoutes = new Elysia({ prefix: "/votes" })
  .use(authMiddleware)
  .get("/:id", async ({ user, error, params }) => {
    if (!user) return error(401, { message: "Unauthorized" });

    const [vote] = await db
      .select()
      .from(votes)
      .where(eq(votes.id, params.id))
      .limit(1);

    if (!vote) {
      return error(404, { message: "Vote not found" });
    }

    return vote;
  })
  .post(
    "/",
    async ({ user, error, body }) => {
      if (!user) return error(401, { message: "Unauthorized" });

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
        title: t.String(),
        maxVotes: t.Number(),
        voteOptions: t.Array(t.String()),
      }),
    },
  )
  .post(
    "/:id/cast",
    async ({ user, error, params, body }) => {
      if (!user) return error(401, { message: "Unauthorized" });

      const [vote] = await db
        .select()
        .from(votes)
        .where(eq(votes.id, params.id))
        .limit(1);

      if (!vote) {
        return error(404, { message: "Vote not found" });
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

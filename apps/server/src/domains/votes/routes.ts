import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { votes } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";

export const voteRoutes = new Elysia({ prefix: "/votes" })
  .use(authMiddleware)
  .get("/:id", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    const [vote] = await db
      .select()
      .from(votes)
      .where(eq(votes.id, ctx.params.id))
      .limit(1);

    if (!vote) {
      return ctx.error(404, { message: "Vote not found" });
    }

    return vote;
  })
  .post(
    "/",
    async (ctx: any) => {
      if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

      const [vote] = await db
        .insert(votes)
        .values({
          title: ctx.body.title,
          maxVotes: ctx.body.maxVotes,
          voteOptions: ctx.body.voteOptions,
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
    async (ctx: any) => {
      if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

      const [vote] = await db
        .select()
        .from(votes)
        .where(eq(votes.id, ctx.params.id))
        .limit(1);

      if (!vote) {
        return ctx.error(404, { message: "Vote not found" });
      }

      // Check if user already voted
      const existingVoterIndex = vote.voters.findIndex(
        (v) => v.userId === ctx.user.id,
      );

      const newVoters = [...vote.voters];

      if (existingVoterIndex >= 0) {
        // Update existing vote
        newVoters[existingVoterIndex] = {
          userId: ctx.user.id,
          votedOptions: ctx.body.votedOptions,
        };
      } else {
        // Add new vote
        newVoters.push({
          userId: ctx.user.id,
          votedOptions: ctx.body.votedOptions,
        });
      }

      const [updatedVote] = await db
        .update(votes)
        .set({ voters: newVoters, updatedAt: new Date() })
        .where(eq(votes.id, ctx.params.id))
        .returning();

      return updatedVote;
    },
    {
      body: t.Object({
        votedOptions: t.Array(t.Number()),
      }),
    },
  );

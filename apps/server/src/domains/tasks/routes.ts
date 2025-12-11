import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { tasks } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";

export const taskRoutes = new Elysia({ prefix: "/tasks" })
  .use(authMiddleware)
  .get("/", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    const taskList = await db.select().from(tasks);

    return taskList;
  })
  .post(
    "/",
    async (ctx: any) => {
      if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

      const [task] = await db
        .insert(tasks)
        .values({
          text: ctx.body.text,
          assigner: ctx.body.assigner,
          isCompleted: false,
        })
        .returning();

      return task;
    },
    {
      body: t.Object({
        text: t.String(),
        assigner: t.String(),
      }),
    },
  )
  .patch(
    "/:id",
    async (ctx: any) => {
      if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

      const updateData: {
        text?: string;
        isCompleted?: boolean;
        assigner?: string;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };

      if (ctx.body.text !== undefined) updateData.text = ctx.body.text;
      if (ctx.body.isCompleted !== undefined)
        updateData.isCompleted = ctx.body.isCompleted;
      if (ctx.body.assigner !== undefined)
        updateData.assigner = ctx.body.assigner;

      const [task] = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, ctx.params.id))
        .returning();

      return task;
    },
    {
      body: t.Object({
        text: t.Optional(t.String()),
        isCompleted: t.Optional(t.Boolean()),
        assigner: t.Optional(t.String()),
      }),
    },
  );

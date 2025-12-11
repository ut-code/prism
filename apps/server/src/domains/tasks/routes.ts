import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { tasks } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";

export const taskRoutes = new Elysia({ prefix: "/tasks" })
  .use(authMiddleware)
  .get("/", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const taskList = await db.select().from(tasks);

    return taskList;
  })
  .post(
    "/",
    async ({ user, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const [task] = await db
        .insert(tasks)
        .values({
          text: body.text,
          assigner: body.assigner,
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
    async ({ user, body, params, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const updateData: {
        text?: string;
        isCompleted?: boolean;
        assigner?: string;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };

      if (body.text !== undefined) updateData.text = body.text;
      if (body.isCompleted !== undefined)
        updateData.isCompleted = body.isCompleted;
      if (body.assigner !== undefined) updateData.assigner = body.assigner;

      const [task] = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, params.id))
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

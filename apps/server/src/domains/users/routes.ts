import { and, eq, inArray } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { personalizations, users } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(authMiddleware)
  .get("/me", async (ctx: any) => {
    if (!ctx.user) return ctx.error(401, { message: "Unauthorized" });

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    return dbUser || null;
  })
  .post(
    "/names",
    async (ctx: any) => {
      const userList = await db
        .select()
        .from(users)
        .where(inArray(users.id, ctx.body.userIds));

      const userNames: Record<string, string> = {};
      for (const user of userList) {
        userNames[user.id] = user.name || "";
      }

      return userNames;
    },
    {
      body: t.Object({
        userIds: t.Array(t.String()),
      }),
    },
  )
  .post(
    "/nicknames",
    async (ctx: any) => {
      const userList = await db
        .select()
        .from(users)
        .where(inArray(users.id, ctx.body.userIds));

      const personalizationList = await db
        .select()
        .from(personalizations)
        .where(
          and(
            inArray(personalizations.userId, ctx.body.userIds),
            eq(personalizations.organizationId, ctx.body.organizationId),
          ),
        );

      const userNicknames: Record<string, string> = {};
      for (const user of userList) {
        const p = personalizationList.find((p) => p.userId === user.id);
        userNicknames[user.id] = p?.nickname || user.name || "";
      }

      return userNicknames;
    },
    {
      body: t.Object({
        userIds: t.Array(t.String()),
        organizationId: t.String(),
      }),
    },
  )
  .get("/search", async (ctx: any) => {
    if (!ctx.query.email) return [];

    const userList = await db
      .select()
      .from(users)
      .where(eq(users.email, ctx.query.email));

    return userList;
  });

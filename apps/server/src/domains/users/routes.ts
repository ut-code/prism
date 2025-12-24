import { and, eq, inArray } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { personalizations, users } from "../../db/schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(authMiddleware)
  .get("/me", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    return dbUser || null;
  })
  .patch(
    "/me",
    async ({ user, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const updateData: {
        name?: string;
        image?: string | null;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };

      if (body.name !== undefined) {
        updateData.name = body.name;
      }
      if (body.image !== undefined) {
        updateData.image = body.image;
      }

      const [updated] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, user.id))
        .returning();

      return updated;
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        image: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    },
  )
  .post(
    "/names",
    async ({ user, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const userList = await db
        .select()
        .from(users)
        .where(inArray(users.id, body.userIds));

      const userNames: Record<string, string> = {};
      for (const dbUser of userList) {
        userNames[dbUser.id] = dbUser.name || "";
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
    async ({ user, body, set }) => {
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const userList = await db
        .select()
        .from(users)
        .where(inArray(users.id, body.userIds));

      const personalizationList = await db
        .select()
        .from(personalizations)
        .where(
          and(
            inArray(personalizations.userId, body.userIds),
            eq(personalizations.organizationId, body.organizationId),
          ),
        );

      const userNicknames: Record<string, string> = {};
      for (const dbUser of userList) {
        const p = personalizationList.find((p) => p.userId === dbUser.id);
        userNicknames[dbUser.id] = p?.nickname || dbUser.name || "";
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
  .get("/search", async ({ user, query, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    if (!query.email) return [];

    const userList = await db
      .select()
      .from(users)
      .where(eq(users.email, query.email));

    return userList;
  });

import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { users } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(authMiddleware)
  .get("/me", async (ctx: any) => {
    if (!ctx.user) {
      return { user: null };
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    return { user: dbUser || null };
  })
  .post(
    "/signin",
    async ({ body, jwt, setCookie }) => {
      const { email } = body;

      // Find or create user
      let [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user) {
        [user] = await db
          .insert(users)
          .values({
            email,
            name: email.split("@")[0],
          })
          .returning();
      }

      // Create JWT token
      const token = await jwt.sign({
        id: user?.id,
        email: user?.email,
        name: user?.name,
      });

      // Set cookie
      setCookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return { success: true, user };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
      }),
    },
  )
  .post("/signout", async ({ setCookie }) => {
    setCookie("token", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return { success: true };
  });

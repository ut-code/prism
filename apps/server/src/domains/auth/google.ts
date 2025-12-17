import {
  decodeIdToken,
  Google,
  generateCodeVerifier,
  generateState,
} from "arctic";
import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import { accounts, users } from "../../db/schema.ts";
import { env } from "../../env.ts";
import { authMiddleware } from "../../middleware/auth.ts";

const redirectUri = `http://localhost:${env.PORT}/auth/google/callback`;
console.log("Google OAuth redirect URI:", redirectUri);
const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  redirectUri,
);

export const googleAuthRoutes = new Elysia({ prefix: "/auth/google" })
  .use(authMiddleware)
  .get("/authorize", async ({ cookie, redirect }) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "email",
      "profile",
    ]);
    console.log("Authorization URL:", url.toString());

    cookie.google_oauth_state?.set({
      value: state,
      httpOnly: true,
      maxAge: 60 * 10,
      path: "/",
    });
    cookie.google_code_verifier?.set({
      value: codeVerifier,
      httpOnly: true,
      maxAge: 60 * 10,
      path: "/",
    });

    return redirect(url.toString());
  })
  .get(
    "/callback",
    async ({ query, cookie, jwt, redirect }) => {
      const { code, state } = query;
      const storedState = cookie.google_oauth_state?.value;
      const codeVerifier = cookie.google_code_verifier?.value;

      if (state !== storedState || typeof codeVerifier !== "string") {
        return redirect(`${env.CORS_ORIGIN}/signin?error=invalid_state`);
      }

      const tokens = await google.validateAuthorizationCode(code, codeVerifier);
      const idToken = tokens.idToken();
      const claims = decodeIdToken(idToken) as {
        sub: string;
        email: string;
        name?: string;
        picture?: string;
      };

      // Find existing account
      const [existingAccount] = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.provider, "google"),
            eq(accounts.providerAccountId, claims.sub),
          ),
        );

      let user: typeof users.$inferSelect | undefined;
      if (existingAccount) {
        [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, existingAccount.userId));
      } else {
        // Check if user with email exists
        [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, claims.email));

        if (!user) {
          [user] = await db
            .insert(users)
            .values({
              email: claims.email,
              name: claims.name ?? claims.email.split("@")[0],
              image: claims.picture,
              emailVerified: new Date(),
            })
            .returning();
        }

        if (!user) {
          return redirect(
            `${env.CORS_ORIGIN}/signin?error=user_creation_failed`,
          );
        }

        // Link account
        await db.insert(accounts).values({
          userId: user.id,
          type: "oauth",
          provider: "google",
          providerAccountId: claims.sub,
          accessToken: tokens.accessToken(),
          idToken: idToken,
        });
      }

      if (!user) {
        return redirect(`${env.CORS_ORIGIN}/signin?error=user_not_found`);
      }

      const token = await jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      cookie.token?.set({
        value: token,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      // Clear OAuth cookies
      cookie.google_oauth_state?.set({ value: "", maxAge: 0, path: "/" });
      cookie.google_code_verifier?.set({ value: "", maxAge: 0, path: "/" });

      return redirect(env.CORS_ORIGIN);
    },
    {
      query: t.Object({
        code: t.String(),
        state: t.String(),
      }),
    },
  );

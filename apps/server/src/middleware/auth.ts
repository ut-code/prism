import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const authMiddleware = new Elysia({ name: "auth" })
  .use(jwt({ name: "jwt", secret: jwtSecret }))
  .derive({ as: "global" }, async ({ jwt, cookie }) => {
    const tokenValue = cookie.token.value;

    if (!tokenValue || typeof tokenValue !== "string") {
      return { user: null as AuthUser | null };
    }

    try {
      const payload = await jwt.verify(tokenValue);
      if (!payload) {
        return { user: null as AuthUser | null };
      }

      // Safely extract user data from JWT payload
      if (
        typeof payload === "object" &&
        payload !== null &&
        "id" in payload &&
        "email" in payload
      ) {
        const user: AuthUser = {
          id: String(payload.id),
          email: String(payload.email),
          name: "name" in payload ? String(payload.name) : undefined,
        };
        return { user: user as AuthUser | null };
      }

      return { user: null as AuthUser | null };
    } catch {
      return { user: null as AuthUser | null };
    }
  })
  .macro(({ onBeforeHandle }) => ({
    requireAuth(enabled: boolean) {
      if (!enabled) return;

      onBeforeHandle(
        ({ user, set }: { user: AuthUser | null; set: { status: number } }) => {
          if (!user) {
            set.status = 401;
            return { message: "Unauthorized" };
          }
        },
      );
    },
  }));

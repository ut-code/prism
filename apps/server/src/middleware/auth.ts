import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export const authMiddleware = new Elysia({ name: "auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "your-secret-key",
    }),
  )
  .use(cookie())
  .derive(async ({ jwt, cookie: cookies }) => {
    const token = cookies.token;

    if (!token) {
      return { user: null };
    }

    try {
      const payload = await jwt.verify(token);
      if (!payload) {
        return { user: null };
      }

      return {
        user: payload as AuthUser,
      };
    } catch {
      return { user: null };
    }
  })
  .macro(({ onBeforeHandle }) => ({
    requireAuth(enabled: boolean) {
      if (!enabled) return;

      onBeforeHandle(({ user, error }) => {
        if (!user) {
          return error(401, { message: "Unauthorized" });
        }
      });
    },
  }));

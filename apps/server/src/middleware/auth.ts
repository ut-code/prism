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
      return { user: null as AuthUser | null };
    }

    try {
      const payload = await jwt.verify(token);
      if (!payload) {
        return { user: null as AuthUser | null };
      }

      return {
        user: {
          id: (payload as any).id,
          email: (payload as any).email,
          name: (payload as any).name,
        } as AuthUser,
      };
    } catch {
      return { user: null as AuthUser | null };
    }
  })
  .macro(({ onBeforeHandle }) => ({
    requireAuth(enabled: boolean) {
      if (!enabled) return;

      onBeforeHandle((ctx: any) => {
        if (!ctx.user) {
          return ctx.error(401, { message: "Unauthorized" });
        }
      });
    },
  }));

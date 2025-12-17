import { Elysia } from "elysia";
import { auth } from "../auth.ts";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export const authMiddleware = new Elysia({ name: "auth" }).derive(
  { as: "global" },
  async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return { user: null as AuthUser | null };
    }

    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? undefined,
    };

    return { user: user as AuthUser | null };
  },
);

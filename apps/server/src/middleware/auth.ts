import { Elysia } from "elysia";
import { auth } from "../auth.ts";
import { env } from "../env.ts";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

const MOCK_USER: AuthUser = {
  id: "dev-user-id",
  email: "dev@example.com",
  name: "Dev User",
};

export const authMiddleware = new Elysia({ name: "auth" }).derive(
  { as: "global" },
  async ({ request }) => {
    if (env.DISABLE_AUTH) {
      return { user: MOCK_USER as AuthUser | null };
    }

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

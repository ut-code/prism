import { type Context, Elysia } from "elysia";
import { auth } from "../../auth.ts";
import { env } from "../../env.ts";

const MOCK_SESSION = {
  session: {
    id: "mock-session-id",
    userId: "dev-user-id",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  user: {
    id: "dev-user-id",
    email: "dev@example.com",
    name: "Dev User",
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const betterAuthView = (context: Context) => {
  // Return mock session when auth is disabled
  if (env.DISABLE_AUTH && context.request.url.endsWith("/get-session")) {
    return Response.json(MOCK_SESSION);
  }

  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
  }
  context.set.status = 405;
  return { error: "Method not allowed" };
};

export const betterAuthRoutes = new Elysia().all("/api/auth/*", betterAuthView);

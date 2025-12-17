import { type Context, Elysia } from "elysia";
import { auth } from "../../auth.ts";

const betterAuthView = (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
  }
  context.set.status = 405;
  return { error: "Method not allowed" };
};

export const betterAuthRoutes = new Elysia().all("/api/auth/*", betterAuthView);

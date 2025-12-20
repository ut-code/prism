import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { betterAuthRoutes } from "./domains/auth/better-auth.ts";
import { channelRoutes } from "./domains/channels/routes.ts";
import { channelUnreadRoutes } from "./domains/channels/unread.ts";
import { dmRoutes } from "./domains/dms/routes.ts";
import { fileRoutes } from "./domains/files/routes.ts";
import { messageRoutes } from "./domains/messages/routes.ts";
import { organizationRoutes } from "./domains/organizations/routes.ts";
import { taskRoutes } from "./domains/tasks/routes.ts";
import { userRoutes } from "./domains/users/routes.ts";
import { voteRoutes } from "./domains/votes/routes.ts";
import { env } from "./env.ts";
import { loggerMiddleware } from "./middleware/logger.ts";
import { wsRoutes } from "./ws/index.ts";

const app = new Elysia()
  .use(loggerMiddleware)
  .use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
  .get("/", () => ({ message: "Prism API Server" }))
  .get("/health", () => ({ status: "ok", timestamp: Date.now() }))
  .use(betterAuthRoutes)
  .use(organizationRoutes)
  .use(channelRoutes)
  .use(channelUnreadRoutes)
  .use(dmRoutes)
  .use(messageRoutes)
  .use(userRoutes)
  .use(fileRoutes)
  .use(taskRoutes)
  .use(voteRoutes)
  .use(wsRoutes)
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;

import { Elysia } from "elysia";
import { authRoutes } from "./domains/auth/routes.ts";
import { channelRoutes } from "./domains/channels/routes.ts";
import { fileRoutes } from "./domains/files/routes.ts";
import { messageRoutes } from "./domains/messages/routes.ts";
import { organizationRoutes } from "./domains/organizations/routes.ts";
import { taskRoutes } from "./domains/tasks/routes.ts";
import { userRoutes } from "./domains/users/routes.ts";
import { voteRoutes } from "./domains/votes/routes.ts";

const app = new Elysia()
  .get("/", () => ({ message: "Prism API Server" }))
  .get("/health", () => ({ status: "ok", timestamp: Date.now() }))
  .use(authRoutes)
  .use(organizationRoutes)
  .use(channelRoutes)
  .use(messageRoutes)
  .use(userRoutes)
  .use(fileRoutes)
  .use(taskRoutes)
  .use(voteRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;

import { Elysia } from "elysia";
import { authRoutes } from "./domains/auth/routes";
import { channelRoutes } from "./domains/channels/routes";
import { fileRoutes } from "./domains/files/routes";
import { messageRoutes } from "./domains/messages/routes";
import { organizationRoutes } from "./domains/organizations/routes";
import { taskRoutes } from "./domains/tasks/routes";
import { userRoutes } from "./domains/users/routes";
import { voteRoutes } from "./domains/votes/routes";

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

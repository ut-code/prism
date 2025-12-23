import { Elysia } from "elysia";
import { authMiddleware } from "../../middleware/auth.ts";
import { messageCreateRoutes } from "./create.routes.ts";
import { messageDeleteRoutes } from "./delete.routes.ts";
import { messageListRoutes } from "./list.routes.ts";
import { messagePinRoutes } from "./pins.ts";
import { messageReactionRoutes } from "./reactions.ts";
import { messageSearchRoutes } from "./search.routes.ts";
import { messageUpdateRoutes } from "./update.routes.ts";

/**
 * Handles message-related operations for channels.
 * Composes list, create, update, delete, search, reaction, and pin routes.
 */
export const messageRoutes = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .use(messageListRoutes)
  .use(messageCreateRoutes)
  .use(messageUpdateRoutes)
  .use(messageDeleteRoutes)
  .use(messageSearchRoutes)
  .use(messageReactionRoutes)
  .use(messagePinRoutes);

import { logger } from "@bogeychan/elysia-logger";

export const loggerMiddleware = logger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  autoLogging: {
    ignore(ctx) {
      return ctx.path === "/health";
    },
  },
});

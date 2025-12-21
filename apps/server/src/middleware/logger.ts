import { logger } from "../lib/logger.ts";

export const loggerMiddleware = logger.into({
  autoLogging: {
    ignore(ctx) {
      return ctx.path === "/health";
    },
  },
});

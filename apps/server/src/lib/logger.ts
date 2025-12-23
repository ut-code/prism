import { createPinoLogger } from "@bogeychan/elysia-logger";

/**
 * Structured logger instance using Pino.
 * Shared across the application and Elysia middleware.
 */
export const logger = createPinoLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

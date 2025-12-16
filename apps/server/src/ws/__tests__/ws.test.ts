import { beforeAll, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { wsRoutes } from "../index.ts";

describe("WebSocket", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret-key";
  });

  it("should initialize ws route", () => {
    const app = new Elysia().use(wsRoutes);
    expect(app).toBeDefined();
  });
});

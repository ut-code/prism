import { beforeAll, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { betterAuthRoutes } from "../better-auth.ts";

describe("Auth - better-auth", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret-key";
  });

  it("should return mock session when auth disabled and path is /get-session", async () => {
    process.env.DISABLE_AUTH = "true";
    const app = new Elysia().use(betterAuthRoutes);

    const response = (await app
      .handle(new Request("http://localhost/api/auth/get-session"))
      .then((res) => res.json())) as {
      session: { id: string; userId: string };
      user: { id: string; email: string };
    };

    expect(response).toHaveProperty("session");
    expect(response).toHaveProperty("user");
    expect(response?.user?.id).toBe("dev-user-id");
    expect(response?.user?.email).toBe("dev@example.com");

    delete process.env.DISABLE_AUTH;
  });

  it("should reject unsupported HTTP methods", async () => {
    const app = new Elysia().use(betterAuthRoutes);

    const response = await app.handle(
      new Request("http://localhost/api/auth/test", {
        method: "PUT",
      }),
    );

    expect(response.status).toBe(405);
    const json = await response.json();
    expect(json).toEqual({ error: "Method not allowed" });
  });

  it("should accept POST method", async () => {
    const app = new Elysia().use(betterAuthRoutes);

    // This will fail auth validation but method should be accepted
    const response = await app.handle(
      new Request("http://localhost/api/auth/test", {
        method: "POST",
      }),
    );

    // Should not be 405
    expect(response.status).not.toBe(405);
  });

  it("should accept GET method", async () => {
    const app = new Elysia().use(betterAuthRoutes);

    const response = await app.handle(
      new Request("http://localhost/api/auth/test", {
        method: "GET",
      }),
    );

    // Should not be 405
    expect(response.status).not.toBe(405);
  });
});

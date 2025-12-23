import { createAuthClient } from "better-auth/svelte";
import { env } from "./env.ts";

export const authClient = createAuthClient({
  baseURL: env.PUBLIC_API_BASE_URL,
});

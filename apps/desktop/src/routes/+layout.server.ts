import { createConvexAuthHandlers } from "@mmailaender/convex-auth-svelte/sveltekit/server";
import { PUBLIC_CONVEX_URL } from "$lib/env.ts";
import type { LayoutServerLoad } from "./$types";

const { getAuthState } = createConvexAuthHandlers({
  convexUrl: PUBLIC_CONVEX_URL,
});

export const load: LayoutServerLoad = async (event) => {
  const authState = await getAuthState(event);

  return { authState };
};

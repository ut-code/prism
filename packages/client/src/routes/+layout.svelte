<script lang="ts">
  import "@@/global.css";

  import { setupConvexAuth } from "@mmailaender/convex-auth-svelte/sveltekit";
  import { setupConvex } from "convex-svelte";
  import { env } from "$lib/env.ts";

  const { children, data } = $props();

  setupConvex(env.PUBLIC_CONVEX_URL);

  setupConvexAuth({
    getServerState: () => data.authState,
    convexUrl: env.PUBLIC_CONVEX_URL,
  });
</script>

{@render children()}

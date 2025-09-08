<script lang="ts">
  import "@@/global.css";

  import { setupConvexAuth } from "@mmailaender/convex-auth-svelte/sveltekit";
  import { setupConvex } from "convex-svelte";
  import { PUBLIC_CONVEX_URL } from "$lib/env.ts";

  const { children, data } = $props();

  setupConvex(PUBLIC_CONVEX_URL);

  setupConvexAuth({
    getServerState: () => data.authState,
    convexUrl: PUBLIC_CONVEX_URL,
  });
</script>

{@render children()}

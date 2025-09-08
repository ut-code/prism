<script lang="ts">
  import "@@/global.css";

  import { setupConvexAuth } from "@mmailaender/convex-auth-svelte/sveltekit";
  import { setupConvex } from "convex-svelte";
  import { setContext } from "svelte";
  import { PUBLIC_CONVEX_URL } from "$lib/env.ts";
  import Modal, { ModalManager } from "$lib/modal/modal.svelte";

  const { children, data } = $props();

  setupConvex(PUBLIC_CONVEX_URL);

  setupConvexAuth({
    getServerState: () => data.authState,
    convexUrl: PUBLIC_CONVEX_URL,
  });

  const modalManager = new ModalManager();
  setContext("modal-manager", modalManager);
</script>

<Modal manager={modalManager} />

{@render children()}

<script lang="ts">
  import "@/app.css";
  import { setupApi } from "@/lib/api.svelte.ts";
  import ConfirmModal from "@/lib/confirm/ConfirmModal.svelte";
  import { env } from "@/lib/env.ts";
  import ToastContainer from "@/lib/toast/ToastContainer.svelte";
  import { setupWebSocket } from "@/lib/websocket/index.ts";

  const { children } = $props();

  // Initialize API client
  setupApi();

  // Initialize WebSocket client (Eden Treaty adds /ws automatically)
  const wsUrl = env.PUBLIC_API_BASE_URL.replace(/^http/, "ws");

  $effect(() => {
    let cleanup: (() => void) | undefined;
    setupWebSocket(wsUrl).then((ws) => {
      cleanup = () => ws.close();
    });
    return () => cleanup?.();
  });
</script>

{@render children()}
<ToastContainer />
<ConfirmModal />

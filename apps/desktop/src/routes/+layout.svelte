<script lang="ts">
  import "@/app.css";
  import { setupApi } from "@/lib/api.svelte.ts";
  import { env } from "@/lib/env.ts";
  import { setupWebSocket } from "@/lib/websocket/index.ts";

  const { children } = $props();

  // Initialize API client
  setupApi();

  // Initialize WebSocket client
  const wsUrl = `${env.PUBLIC_API_BASE_URL.replace(/^http/, "ws")}/ws`;

  $effect(() => {
    let cleanup: (() => void) | undefined;
    setupWebSocket(wsUrl).then((ws) => {
      cleanup = () => ws.close();
    });
    return () => cleanup?.();
  });
</script>

{@render children()}

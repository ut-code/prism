<script lang="ts">
  import "@/app.css";
  import { setupApi } from "@/lib/api.svelte.ts";
  import { env } from "@/lib/env.ts";
  import { setupWebSocket } from "@/lib/websocket/index.ts";

  const { children } = $props();

  // Initialize API client (uses PUBLIC_API_BASE_URL env var)
  setupApi();

  // Initialize WebSocket client
  const wsUrl = `${env.PUBLIC_API_BASE_URL.replace(/^http/, "ws")}/ws`;
  const ws = setupWebSocket(wsUrl);

  $effect(() => {
    ws.connect();
    return () => ws.disconnect();
  });
</script>

{@render children()}

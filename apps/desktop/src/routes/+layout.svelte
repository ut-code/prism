<script lang="ts">
  import "@/app.css";
  import { setupApi } from "@/lib/api.svelte.ts";

  const { children } = $props();

  // Initialize API client (uses PUBLIC_API_BASE_URL env var)
  setupApi();
</script>

{@render children()}

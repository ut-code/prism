<script lang="ts">
  import "@/app.css";
  import { setupApi } from "@/lib/api.svelte.ts";

  const { children } = $props();

  // Initialize API client
  setupApi("http://localhost:3000");
</script>

{@render children()}

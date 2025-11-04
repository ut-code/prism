<script lang="ts">
  import { useAuth } from "@mmailaender/convex-auth-svelte/sveltekit";

  const isAuthenticated = $derived(useAuth().isAuthenticated);
  const isLoading = $derived(useAuth().isLoading);
  const { signOut } = useAuth();
</script>

{#if isLoading}
  <p>Loading...</p>
{:else if isAuthenticated}
  <p>for development purposes</p>
  <button onclick={() => signOut()}>Sign Out</button>
{/if}

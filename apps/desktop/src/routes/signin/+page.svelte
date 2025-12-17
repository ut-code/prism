<script lang="ts">
  import { useAuth } from "@/lib/auth.svelte.ts";
  import { goto } from "$app/navigation";
  import GoogleButton from "./GoogleButton.svelte";

  const auth = useAuth();
  const isAuthenticated = $derived(auth.isAuthenticated);
  const isLoading = $derived(auth.isLoading);

  $effect(() => {
    if (isAuthenticated) {
      goto("/", { replaceState: true });
    }
  });

  function handleGoogleSignIn() {
    const apiUrl = import.meta.env.PUBLIC_API_BASE_URL;
    window.location.href = `${apiUrl}/auth/google/authorize`;
  }
</script>

<div class="hero bg-base-200 min-h-screen">
  <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
    <div class="card-body">
      <h1 class="text-2xl font-bold">Sign In to Prism</h1>
      {#if isLoading}
        <span class="loading loading-spinner mx-auto"></span>
      {:else}
        <GoogleButton onclick={handleGoogleSignIn} />
      {/if}
    </div>
  </div>
</div>

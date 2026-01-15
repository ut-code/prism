<script lang="ts">
  import { useAuth } from "@/lib/auth.svelte.ts";
  import { goto } from "$app/navigation";

  const auth = useAuth();
  const isAuthenticated = $derived(auth.isAuthenticated);
  const isLoading = $derived(auth.isLoading);

  async function handleSignOut() {
    await auth.signOut();
    goto("/signin", { replaceState: true });
  }
</script>

<svelte:head>
  <title>Sign Out - Prism</title>
</svelte:head>

{#if isLoading}
  <div class="flex min-h-screen items-center justify-center">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{:else if isAuthenticated}
  <div class="hero bg-base-200 min-h-screen">
    <div class="card bg-base-100 w-full max-w-sm shadow-2xl">
      <div class="card-body">
        <h1 class="text-2xl font-bold">Sign Out</h1>
        <p class="text-base-content/70">Are you sure you want to sign out?</p>
        <div class="card-actions mt-4 justify-end">
          <a href="/" class="btn btn-ghost">Cancel</a>
          <button class="btn btn-primary" onclick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="hero bg-base-200 min-h-screen">
    <div class="text-center">
      <p>Not signed in</p>
      <a href="/signin" class="link mt-2">Go to Sign In</a>
    </div>
  </div>
{/if}

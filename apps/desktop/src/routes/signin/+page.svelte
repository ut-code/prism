<script lang="ts">
  import { useAuth } from "@/lib/auth.svelte.ts";
  import { goto } from "$app/navigation";

  const auth = useAuth();
  const isAuthenticated = $derived(auth.isAuthenticated);
  const isLoading = $derived(auth.isLoading);

  let email = $state("");
  let submitting = $state(false);

  $effect(() => {
    if (isAuthenticated) {
      goto("/", { replaceState: true });
    }
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    submitting = true;
    try {
      await auth.signIn(email);
      goto("/", { replaceState: true });
    } catch {
      alert("Sign in failed");
    } finally {
      submitting = false;
    }
  }
</script>

<div class="hero bg-base-200 min-h-screen">
  <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
    <form class="card-body" onsubmit={handleSubmit}>
      <h1 class="text-2xl font-bold">Sign In to Prism</h1>

      <div class="form-control">
        <label class="label" for="email">
          <span class="label-text">Email</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="email@example.com"
          class="input input-bordered"
          bind:value={email}
          required
        />
      </div>

      <div class="form-control mt-6">
        <button
          type="submit"
          class="btn btn-primary"
          disabled={isLoading || submitting}
        >
          {#if isLoading || submitting}
            <span class="loading loading-spinner"></span>
          {/if}
          Sign In
        </button>
      </div>
    </form>
  </div>
</div>

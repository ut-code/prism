<script lang="ts">
  import { useAuth } from "@mmailaender/convex-auth-svelte/sveltekit";
  import { goto } from "$app/navigation";
  import { type Id } from "@packages/convex";
  import OrganizationSelector from "$components/organization/OrganizationSelector.svelte";

  const auth = useAuth();

  function handleOrganizationSelect(organizationId: Id<"organizations">) {
    goto(`/chat/${organizationId}`);
  }
</script>

{#if auth.isLoading}
  <div class="flex h-screen w-full items-center justify-center">
    <span class="loading loading-dots loading-lg"></span>
  </div>
{:else if auth.isAuthenticated}
  <OrganizationSelector onSelect={handleOrganizationSelect} />
{:else}
  <div class="hero bg-base-100 min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-7xl font-bold">Prism</h1>
        <p class="py-6">The ultimate chat tool for engineers.</p>
        <a href="/signin" class="btn btn-primary">Get Started</a>
      </div>
    </div>
  </div>
{/if}

<script lang="ts">
  import OrganizationSelector from "@/components/organization/OrganizationSelector.svelte";
  import { useAuth } from "@/lib/auth.svelte.ts";
  import { goto } from "$app/navigation";

  const auth = useAuth();

  function handleOrganizationSelect(organizationId: string) {
    goto(`/orgs/${organizationId}`);
  }
</script>

<svelte:head>
  <title>Prism</title>
</svelte:head>

{#if auth.isLoading}
  <div class="flex h-screen w-full items-center justify-center">
    <span class="loading loading-dots loading-lg"></span>
  </div>
{:else if auth.isAuthenticated}
  <OrganizationSelector onselect={handleOrganizationSelect} />
{:else}
  <div class="hero bg-base-100 min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-7xl font-bold">Prism</h1>
        <p class="py-6">The Ultimate Chat Tool for Engineers</p>
        <a href="/signin" class="btn btn-primary">Get Started</a>
      </div>
    </div>
  </div>
{/if}

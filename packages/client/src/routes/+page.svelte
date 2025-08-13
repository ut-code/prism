<script lang="ts">
  import { useAuth } from "@mmailaender/convex-auth-svelte/sveltekit";
  import { type Id } from "@packages/convex";
  import OrganizationChatApp from "$components/organization/OrganizationChatApp.svelte";
  import OrganizationSelector from "$components/organization/OrganizationSelector.svelte";

  const auth = useAuth();

  let selectedOrganizationId = $state<Id<"organizations"> | undefined>(
    undefined,
  );

  function handleOrganizationSelect(organizationId: Id<"organizations">) {
    selectedOrganizationId = organizationId;
  }

  function handleOrganizationChange() {
    selectedOrganizationId = undefined;
  }
</script>

{#if auth.isLoading}
  <div class="flex h-screen w-full items-center justify-center">
    <span class="loading loading-dots loading-lg"></span>
  </div>
{:else if auth.isAuthenticated}
  {#if selectedOrganizationId}
    <OrganizationChatApp
      organizationId={selectedOrganizationId}
      onOrganizationChange={handleOrganizationChange}
    />
  {:else}
    <OrganizationSelector onSelect={handleOrganizationSelect} />
  {/if}
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

<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useQuery } from "convex-svelte";
  import { goto } from "$app/navigation";

  const organizations = useQuery(api.organizations.list, () => ({}));

  function navigateToOrganization(orgId: Id<"organizations">) {
    goto(`/organizations/${orgId}`);
  }
</script>

<div class="container mx-auto p-6">
  <div class="mb-8">
    <h1 class="text-base-content mb-2 text-3xl font-bold">組織管理</h1>
    <p class="text-base-content/70">参加している組織の管理と新しい組織の作成</p>
  </div>

  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {#if organizations.data}
      {#each organizations.data as org}
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">{org.name}</h2>
            {#if org.description}
              <p class="text-base-content/70">{org.description}</p>
            {/if}
            <div class="mt-4 flex items-center justify-between">
              <div class="badge badge-outline capitalize">{org.role}</div>
              <div class="card-actions">
                <button
                  class="btn btn-primary btn-sm"
                  onclick={() => org._id && navigateToOrganization(org._id)}
                >
                  詳細
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <div class="col-span-full flex justify-center">
        <span class="loading loading-dots loading-lg"></span>
      </div>
    {/if}
  </div>

  {#if organizations.data && organizations.data.length === 0}
    <div class="py-12 text-center">
      <p class="text-base-content/60 mb-6">参加している組織がありません</p>
      <button
        class="btn btn-primary"
        onclick={() => goto("/organizations/create")}
      >
        新しい組織を作成
      </button>
    </div>
  {/if}

  <div class="fixed right-6 bottom-6">
    <button
      class="btn btn-primary btn-circle btn-lg"
      onclick={() => goto("/organizations/create")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  </div>
</div>

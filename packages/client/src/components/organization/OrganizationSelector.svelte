<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useQuery } from "convex-svelte";

  interface Props {
    onselect: (organizationId: Id<"organizations">) => void;
  }

  const { onselect }: Props = $props();

  const organizations = useQuery(api.organizations.list, () => ({}));
</script>

<div class="bg-base-100 flex min-h-screen items-center justify-center p-4">
  <div class="w-full max-w-md">
    <div class="mb-8 text-center">
      <h1 class="text-base-content mb-2 text-4xl font-bold">組織を選択</h1>
      <p class="text-base-content/70">
        参加している組織からチャットする組織を選んでください
      </p>
    </div>

    <div class="space-y-3">
      {#if organizations.data}
        {#each organizations.data as org}
          <button
            class="card bg-base-200 hover:bg-base-300 w-full cursor-pointer text-left transition-colors"
            onclick={() => org._id && onselect(org._id)}
          >
            <div class="card-body p-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-base-content font-semibold">{org.name}</h3>
                  {#if org.description}
                    <p class="text-base-content/70 mt-1 text-sm">
                      {org.description}
                    </p>
                  {/if}
                </div>
                <div class="badge badge-outline capitalize">
                  {org.permission}
                </div>
              </div>
            </div>
          </button>
        {/each}
      {:else}
        <div class="py-8 text-center">
          <span class="loading loading-dots loading-lg"></span>
        </div>
      {/if}
    </div>

    {#if organizations.data && organizations.data.length === 0}
      <div class="py-8 text-center">
        <p class="text-base-content/60 mb-4">参加している組織がありません</p>
        <a href="/orgs/new" class="btn btn-primary">
          新しい組織を作成
        </a>
      </div>
    {/if}
  </div>
</div>

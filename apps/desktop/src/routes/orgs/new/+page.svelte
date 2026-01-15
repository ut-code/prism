<script lang="ts">
  import { getApiClient, unwrapResponse, useMutation } from "@/lib/api.svelte";
  import { goto } from "$app/navigation";

  const api = getApiClient();
  const createOrganization = useMutation(
    async (data: { name: string; description?: string }) =>
      unwrapResponse<{ id: string }>(await api.organizations.post(data)),
  );

  let form = $state({
    name: "",
    description: "",
  });

  async function handleSubmit() {
    if (!form.name.trim()) return;

    try {
      const result = await createOrganization.run({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });

      if (result) {
        goto(`/orgs/${result.id}/settings`);
      }
    } catch (error) {
      console.error("Failed to create organization:", error);
      alert("Failed to create organization");
    }
  }

  function goBack() {
    goto("/");
  }
</script>

<svelte:head>
  <title>Create Organization - Prism</title>
</svelte:head>

<div class="container mx-auto max-w-md p-6">
  <div class="mb-6">
    <button class="btn btn-ghost btn-sm mb-4" onclick={goBack}>
      ← Back to Home
    </button>

    <h1 class="text-base-content mb-2 text-3xl font-bold">
      Create New Organization
    </h1>
    <p class="text-base-content/70">
      Create a new organization and start collaborating with members
    </p>
  </div>

  <div class="card bg-base-200 shadow-xl">
    <div class="card-body">
      <form onsubmit={handleSubmit}>
        <div class="form-control mb-4">
          <label class="label" for="name">
            <span class="label-text font-medium">Organization Name</span>
            <span class="label-text-alt text-error">Required</span>
          </label>
          <input
            id="name"
            bind:value={form.name}
            type="text"
            class="input input-bordered w-full"
            placeholder="e.g., Acme Inc."
            required
            disabled={createOrganization.processing}
          />
        </div>

        <div class="form-control mb-6">
          <label class="label" for="description">
            <span class="label-text font-medium">Description</span>
            <span class="label-text-alt">Optional</span>
          </label>
          <textarea
            id="description"
            bind:value={form.description}
            class="textarea textarea-bordered h-24 w-full"
            placeholder="Brief description of your organization"
            disabled={createOrganization.processing}
          ></textarea>
        </div>

        <div class="card-actions justify-end">
          <button
            type="button"
            class="btn btn-ghost"
            onclick={goBack}
            disabled={createOrganization.processing}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={createOrganization.processing || !form.name.trim()}
          >
            {#if createOrganization.processing}
              <span class="loading loading-spinner loading-sm"></span>
              Creating...
            {:else}
              Create Organization
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

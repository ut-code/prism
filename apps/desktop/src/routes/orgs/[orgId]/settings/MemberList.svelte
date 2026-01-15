<script lang="ts">
  import type { Organization, OrganizationMember } from "@packages/api-client";

  interface Props {
    organization: Organization | undefined;
    members: OrganizationMember[] | undefined;
    onAddMember: (email: string) => Promise<void>;
    onRemoveMember: (userId: string) => void;
  }

  const { organization, members, onAddMember, onRemoveMember }: Props =
    $props();

  let isModalOpen = $state(false);
  let email = $state("");
  let isSubmitting = $state(false);
  let errorMessage = $state("");

  function openModal() {
    email = "";
    errorMessage = "";
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    email = "";
    errorMessage = "";
  }

  async function handleSubmit() {
    if (!email.trim()) {
      errorMessage = "Please enter an email address";
      return;
    }

    isSubmitting = true;
    errorMessage = "";

    try {
      await onAddMember(email.trim());
      closeModal();
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : "Failed to add member";
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isModalOpen}
  <dialog class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Add Member</h3>
      <p class="text-base-content/70 py-2">
        Enter the email address of the user you want to add.
      </p>

      <div class="form-control mt-4">
        <input
          type="email"
          placeholder="user@example.com"
          class="input input-bordered w-full"
          bind:value={email}
          disabled={isSubmitting}
          onkeydown={(e) => e.key === "Enter" && handleSubmit()}
        />
        {#if errorMessage}
          <p class="label-text-alt text-error mt-1">{errorMessage}</p>
        {/if}
      </div>

      <div class="modal-action">
        <button
          class="btn btn-ghost"
          onclick={closeModal}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          class="btn btn-primary"
          onclick={handleSubmit}
          disabled={isSubmitting || !email.trim()}
        >
          {#if isSubmitting}
            <span class="loading loading-spinner loading-sm"></span>
          {/if}
          Add Member
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={closeModal}>close</button>
    </form>
  </dialog>
{/if}

<div class="card bg-base-200 shadow-xl">
  <div class="card-body">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="card-title">Members</h2>
      {#if organization?.permission === "admin"}
        <button class="btn btn-primary btn-sm" onclick={openModal}>
          Add Member
        </button>
      {/if}
    </div>

    {#if members}
      <div class="space-y-2">
        {#each members as member}
          <div
            class="bg-base-300 flex items-center justify-between rounded-lg p-3"
          >
            <div class="flex items-center gap-3">
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content w-10 rounded-full">
                  <span class="text-sm">{member.user?.name?.[0] || "?"}</span>
                </div>
              </div>
              <div>
                <div class="font-medium">
                  {member.user?.name || "Unknown User"}
                </div>
                <div class="text-base-content/70 text-sm">
                  {member.user?.email}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="badge badge-outline capitalize">
                {member.permission}
              </div>
              {#if organization?.permission === "admin" && member.userId !== organization?.ownerId}
                <button
                  class="btn btn-ghost btn-sm text-error"
                  onclick={() => onRemoveMember(member.userId)}
                >
                  Remove
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex justify-center">
        <span class="loading loading-dots loading-md"></span>
      </div>
    {/if}
  </div>
</div>

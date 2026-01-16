<script lang="ts">
  import type { Channel } from "@packages/api-client";
  import Modal, { ModalManager } from "@/lib/modal/modal.svelte";

  interface Props {
    onSave: (
      channelId: string,
      name: string,
      description: string,
    ) => Promise<void>;
    registerOpen?: (fn: (channel: Channel) => void) => void;
  }

  const { onSave, registerOpen }: Props = $props();

  let channelId = $state("");
  let name = $state("");
  let description = $state("");
  let form: HTMLFormElement | null = $state(null);
  let disabled = $state(false);

  const modalManager = new ModalManager();

  function openModal(channel: Channel) {
    channelId = channel.id;
    name = channel.name;
    description = channel.description ?? "";
    modalManager.dispatch(editChannelModalContent);
  }

  $effect(() => {
    registerOpen?.(openModal);
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (disabled || !name.trim()) return;

    disabled = true;
    try {
      await onSave(channelId, name.trim(), description.trim());
    } catch (error) {
      console.error("Failed to update channel:", error);
    } finally {
      disabled = false;
      form?.reset();
      channelId = "";
      name = "";
      description = "";
      modalManager.close();
    }
  }
</script>

<Modal manager={modalManager} />

{#snippet editChannelModalContent()}
  <form bind:this={form} onsubmit={handleSubmit} class="flex flex-col gap-4">
    <h3 class="text-lg font-medium">Edit Channel</h3>

    <div class="flex flex-col gap-2">
      <label for="edit-channel-name" class="text-sm font-medium">Name</label>
      <input
        id="edit-channel-name"
        type="text"
        placeholder="Channel name"
        class="input input-bordered"
        bind:value={name}
      />
    </div>

    <div class="flex flex-col gap-2">
      <label for="edit-channel-description" class="text-muted text-sm">
        Description (optional)
      </label>
      <textarea
        id="edit-channel-description"
        placeholder="Channel description"
        class="textarea textarea-bordered"
        rows="3"
        bind:value={description}
      ></textarea>
    </div>

    <div class="flex justify-end gap-2">
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        onclick={() => modalManager.close()}
      >
        Cancel
      </button>
      {#if disabled}
        <button type="submit" class="btn btn-primary btn-sm" disabled>
          Saving...
          <span class="loading loading-spinner loading-xs"></span>
        </button>
      {:else}
        <button type="submit" class="btn btn-primary btn-sm">Save</button>
      {/if}
    </div>
  </form>
{/snippet}

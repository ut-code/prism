<script lang="ts">
  import type { Channel } from "@packages/api-client";

  interface Props {
    isOpen: boolean;
    channel: Channel | null;
    onClose: () => void;
    onSave: (
      channelId: string,
      name: string,
      description: string,
    ) => Promise<void>;
  }

  let { isOpen, channel, onClose, onSave }: Props = $props();

  let name = $state("");
  let description = $state("");
  let disabled = $state(false);
  let dialog: HTMLDialogElement | null = $state(null);

  $effect(() => {
    if (isOpen && channel) {
      name = channel.name;
      description = channel.description ?? "";
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (disabled || !name.trim() || !channel) return;

    disabled = true;
    try {
      await onSave(channel.id, name.trim(), description.trim());
      onClose();
    } catch {
      // Error handled by controller
    } finally {
      disabled = false;
    }
  }
</script>

<dialog bind:this={dialog} class="modal" onclose={onClose}>
  <div class="modal-box">
    <form onsubmit={handleSubmit} class="flex flex-col gap-4">
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
        <button type="button" class="btn btn-ghost btn-sm" onclick={onClose}>
          Cancel
        </button>
        <button type="submit" class="btn btn-primary btn-sm" {disabled}>
          {#if disabled}
            Saving...
            <span class="loading loading-spinner loading-xs"></span>
          {:else}
            Save
          {/if}
        </button>
      </div>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button type="submit">close</button>
  </form>
</dialog>

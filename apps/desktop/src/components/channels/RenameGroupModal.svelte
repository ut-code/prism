<script lang="ts">
  interface Props {
    isOpen: boolean;
    groupId: string;
    currentName: string;
    onClose: () => void;
    onRename: (groupId: string, newName: string) => Promise<void>;
  }

  let { isOpen, groupId, currentName, onClose, onRename }: Props = $props();

  let name = $state("");
  let disabled = $state(false);
  let dialog: HTMLDialogElement | null = $state(null);

  $effect(() => {
    if (isOpen) {
      name = currentName;
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (disabled || !name.trim()) return;

    disabled = true;
    try {
      await onRename(groupId, name.trim());
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
      <h3 class="text-lg font-medium">Rename Group</h3>

      <div class="flex flex-col gap-2">
        <label for="rename-group-name" class="text-sm font-medium">Name</label>
        <input
          id="rename-group-name"
          type="text"
          placeholder="Group name"
          class="input input-bordered"
          bind:value={name}
        />
      </div>

      <div class="flex justify-end gap-2">
        <button type="button" class="btn btn-ghost btn-sm" onclick={onClose}>
          Cancel
        </button>
        <button type="submit" class="btn btn-primary btn-sm" {disabled}>
          {#if disabled}
            Renaming...
            <span class="loading loading-spinner loading-xs"></span>
          {:else}
            Rename
          {/if}
        </button>
      </div>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button type="submit">close</button>
  </form>
</dialog>

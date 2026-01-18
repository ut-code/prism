<script lang="ts">
  import type { ChannelGroup } from "@packages/api-client";

  interface Props {
    groups: ChannelGroup[];
    isOpen: boolean;
    defaultParentGroupId: string | null;
    onClose: () => void;
    onCreate: (name: string, parentGroupId: string | null) => Promise<void>;
  }

  let { groups, isOpen, defaultParentGroupId, onClose, onCreate }: Props =
    $props();

  let name = $state("");
  let parentGroupId = $state<string | null>(null);
  let disabled = $state(false);
  let dialog: HTMLDialogElement | null = $state(null);

  $effect(() => {
    if (isOpen) {
      name = "";
      parentGroupId = defaultParentGroupId;
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
      await onCreate(name.trim(), parentGroupId);
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
      <h3 class="text-lg font-medium">Create Channel Group</h3>

      <div class="flex flex-col gap-2">
        <label for="group-name" class="text-sm font-medium">Name</label>
        <input
          id="group-name"
          type="text"
          placeholder="Group name"
          class="input input-bordered"
          bind:value={name}
        />
      </div>

      {#if groups.length > 0}
        <div class="flex flex-col gap-2">
          <label for="parent-group" class="text-muted text-sm">
            Parent group (optional)
          </label>
          <select
            id="parent-group"
            class="select select-bordered"
            bind:value={parentGroupId}
          >
            <option value={null}>None</option>
            {#each groups as group (group.id)}
              <option value={group.id}>{group.name}</option>
            {/each}
          </select>
        </div>
      {/if}

      <div class="flex justify-end gap-2">
        <button type="button" class="btn btn-ghost btn-sm" onclick={onClose}>
          Cancel
        </button>
        <button type="submit" class="btn btn-primary btn-sm" {disabled}>
          {#if disabled}
            Creating...
            <span class="loading loading-spinner loading-xs"></span>
          {:else}
            Create
          {/if}
        </button>
      </div>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button type="submit">close</button>
  </form>
</dialog>

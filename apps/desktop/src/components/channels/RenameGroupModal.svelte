<script lang="ts">
  import Modal, { ModalManager } from "@/lib/modal/modal.svelte";

  interface Props {
    onRename: (groupId: string, newName: string) => Promise<void>;
    registerOpen?: (fn: (groupId: string, currentName: string) => void) => void;
  }

  const { onRename, registerOpen }: Props = $props();

  let name = $state("");
  let groupId = $state("");
  let form: HTMLFormElement | null = $state(null);
  let disabled = $state(false);

  const modalManager = new ModalManager();

  function openModal(id: string, currentName: string) {
    groupId = id;
    name = currentName;
    modalManager.dispatch(renameModalContent);
  }

  $effect(() => {
    registerOpen?.(openModal);
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (disabled || !name.trim()) return;

    disabled = true;
    try {
      await onRename(groupId, name.trim());
    } catch (error) {
      console.error("Failed to rename group:", error);
    } finally {
      disabled = false;
      form?.reset();
      name = "";
      groupId = "";
      modalManager.close();
    }
  }
</script>

<Modal manager={modalManager} />

{#snippet renameModalContent()}
  <form bind:this={form} onsubmit={handleSubmit} class="flex flex-col gap-4">
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
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        onclick={() => modalManager.close()}
      >
        Cancel
      </button>
      {#if disabled}
        <button type="submit" class="btn btn-primary btn-sm" disabled>
          Renaming...
          <span class="loading loading-spinner loading-xs"></span>
        </button>
      {:else}
        <button type="submit" class="btn btn-primary btn-sm">Rename</button>
      {/if}
    </div>
  </form>
{/snippet}

<script lang="ts">
  import FolderPlus from "@lucide/svelte/icons/folder-plus";
  import Modal, { ModalManager } from "@/lib/modal/modal.svelte";
  import type { ChannelGroup } from "./channelGroups.svelte.ts";

  interface Props {
    groups?: ChannelGroup[];
    defaultParentGroupId?: string | null;
    onCreate?: (name: string, parentGroupId: string | null) => Promise<void>;
    showButton?: boolean;
    registerOpen?: (fn: () => void) => void;
  }

  const {
    groups = [],
    defaultParentGroupId,
    onCreate,
    showButton = true,
    registerOpen,
  }: Props = $props();

  let name = $state("");
  let parentGroupId = $state("");
  let form: HTMLFormElement | null = $state(null);
  let disabled = $state(false);

  const modalManager = new ModalManager();

  function openModal() {
    parentGroupId = defaultParentGroupId ?? "";
    modalManager.dispatch(createGroupModalContent);
  }

  $effect(() => {
    registerOpen?.(openModal);
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (disabled || !name.trim()) return;

    disabled = true;
    try {
      await onCreate?.(name.trim(), parentGroupId || null);
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      disabled = false;
      form?.reset();
      name = "";
      parentGroupId = defaultParentGroupId ?? "";
      modalManager.close();
    }
  }
</script>

<Modal manager={modalManager} />

{#if showButton}
  <button
    class="btn btn-ghost btn-xs btn-square"
    title="New group"
    onclick={openModal}
  >
    <FolderPlus class="text-muted size-4" />
  </button>
{/if}

{#snippet createGroupModalContent()}
  <form bind:this={form} onsubmit={handleSubmit} class="flex flex-col gap-4">
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
          <option value="">None</option>
          {#each groups as group (group.id)}
            <option value={group.id}>{group.name}</option>
          {/each}
        </select>
      </div>
    {/if}

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
          Creating...
          <span class="loading loading-spinner loading-xs"></span>
        </button>
      {:else}
        <button type="submit" class="btn btn-primary btn-sm">Create</button>
      {/if}
    </div>
  </form>
{/snippet}

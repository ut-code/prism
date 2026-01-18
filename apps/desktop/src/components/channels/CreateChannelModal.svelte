<script lang="ts">
  import type { ChannelGroup } from "@packages/api-client";
  import { getApiClient, unwrapResponse } from "@/lib/api.svelte";
  import { showToast } from "@/lib/toast/toast.svelte.ts";

  const api = getApiClient();

  interface Props {
    organizationId: string;
    groups: ChannelGroup[];
    isOpen: boolean;
    defaultGroupId: string | null;
    onClose: () => void;
    onCreated: () => void;
  }

  let {
    organizationId,
    groups,
    isOpen,
    defaultGroupId,
    onClose,
    onCreated,
  }: Props = $props();

  let name = $state("");
  let groupId = $state<string | null>(null);
  let disabled = $state(false);
  let dialog: HTMLDialogElement | null = $state(null);

  $effect(() => {
    if (isOpen) {
      name = "";
      groupId = defaultGroupId;
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
      const response = await api.channels.post({
        name: name.trim(),
        organizationId,
        groupId: groupId ?? undefined,
      });
      unwrapResponse(response);
      onCreated();
      showToast("Channel created", "success");
      onClose();
    } catch (error) {
      showToast("Failed to create channel", "error");
    } finally {
      disabled = false;
    }
  }
</script>

<dialog bind:this={dialog} class="modal" onclose={onClose}>
  <div class="modal-box">
    <form onsubmit={handleSubmit} class="flex flex-col gap-4">
      <h3 class="text-lg font-medium">Create Channel</h3>

      <div class="flex flex-col gap-2">
        <label for="channel-name" class="text-sm font-medium">Name</label>
        <input
          id="channel-name"
          type="text"
          placeholder="Channel name"
          class="input input-bordered"
          bind:value={name}
        />
      </div>

      {#if groups.length > 0}
        <div class="flex flex-col gap-2">
          <label for="channel-group" class="text-muted text-sm">
            Group (optional)
          </label>
          <select
            id="channel-group"
            class="select select-bordered"
            bind:value={groupId}
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

<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import { getApiClient, unwrapResponse } from "@/lib/api.svelte";
  import Modal, { ModalManager } from "@/lib/modal/modal.svelte";
  import type { ChannelGroup } from "./channelGroups.svelte.ts";

  const api = getApiClient();

  interface Props {
    organizationId: string;
    groups?: ChannelGroup[];
    defaultGroupId?: string | null;
    onCreated?: () => void;
    showButton?: boolean;
    registerOpen?: (fn: () => void) => void;
  }
  const {
    organizationId,
    groups = [],
    defaultGroupId,
    onCreated,
    showButton = true,
    registerOpen,
  }: Props = $props();

  let name = $state("");
  let groupId = $state<string | null>(null);
  let form: HTMLFormElement | null = $state(null);
  let disabled = $state(false);

  const modalManager = new ModalManager();

  function openModal() {
    groupId = defaultGroupId ?? null;
    modalManager.dispatch(createChannelModalContent);
  }

  $effect(() => {
    registerOpen?.(openModal);
  });

  async function createChannel(event: Event) {
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
      onCreated?.();
    } catch (error) {
      console.error(error);
    } finally {
      disabled = false;
      form?.reset();
      name = "";
      groupId = defaultGroupId ?? null;
      modalManager.close();
    }
  }
</script>

<Modal manager={modalManager} />

{#if showButton}
  <button
    class="btn btn-ghost btn-xs btn-square"
    title="New channel"
    onclick={openModal}
  >
    <Plus class="text-muted size-4" />
  </button>
{/if}

{#snippet createChannelModalContent()}
  <form bind:this={form} onsubmit={createChannel} class="flex flex-col gap-4">
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

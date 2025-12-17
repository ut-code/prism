<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import { getApiClient, unwrapResponse } from "@/lib/api.svelte";
  import Modal, { ModalManager } from "@/lib/modal/modal.svelte";

  const api = getApiClient();

  interface Props {
    organizationId: string;
  }
  const { organizationId }: Props = $props();

  let newChannelName = $state("");
  let form: HTMLFormElement | null = $state(null);
  let disabled = $state(false);

  const modalManager = new ModalManager();
  async function createChannel(event: Event) {
    event.preventDefault();

    if (disabled) return;
    disabled = true;
    try {
      if (newChannelName.trim()) {
        const response = await api.channels.post({
          name: newChannelName.trim(),
          organizationId,
        });
        unwrapResponse(response);
      }
    } catch (error) {
      console.error(error);
    } finally {
      disabled = false;
      form?.reset();
      modalManager.close();
    }
  }
</script>

<Modal manager={modalManager} />

<button
  class="btn btn-ghost btn-xs btn-square"
  title="新しいチャンネル"
  onclick={() => {
    modalManager.dispatch(createChannelModalContent);
  }}
>
  <Plus class="text-muted size-4" />
</button>

{#snippet createChannelModalContent()}
  <form
    bind:this={form}
    onsubmit={createChannel}
    class="flex items-center gap-2"
  >
    <input
      type="text"
      placeholder="チャンネル名"
      class="input input-bordered"
      bind:value={newChannelName}
    />
    {#if disabled}
      <button type="submit" class="btn btn-primary btn-sm" disabled>
        作成中...
        <span class="loading loading-spinner"></span>
      </button>
    {:else}
      <button type="submit" class="btn btn-primary btn-sm">作成</button>
    {/if}
  </form>
{/snippet}

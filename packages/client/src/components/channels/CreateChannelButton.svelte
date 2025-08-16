<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useConvexClient } from "convex-svelte";
  import Modal, { ModalManager } from "~/lib/modal/modal.svelte";

  const convex = useConvexClient();

  interface Props {
    organizationId: Id<"organizations">;
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
        await convex.mutation(api.channels.create, {
          name: newChannelName.trim(),
          organizationId,
        });
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
  class="btn btn-primary btn-sm mt-2 w-full"
  onclick={() => {
    modalManager.dispatch(createChannelModalContent);
  }}
>
  + 新しいチャンネル
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

<script lang="ts" module>
  import type { Snippet } from "svelte";
  export class ModalManager {
    snippet: Snippet | null = $state(null);
    dialog: HTMLDialogElement | null = $state(null);

    dispatch(children: Snippet) {
      this.snippet = children;
      this.dialog?.showModal();
    }

    close() {
      this.dialog?.close();
      this.snippet = null;
    }
  }
</script>

<script lang="ts">
  interface Props {
    manager: ModalManager;
    clickOutsideToClose?: boolean;
  }

  const { manager: m = $bindable(), clickOutsideToClose = true }: Props =
    $props();
</script>

<dialog bind:this={m.dialog} class="modal" onclose={() => m.close()}>
  <div class="modal-box">
    {#if m.snippet}
      {@render m.snippet()}
    {/if}
  </div>
  {#if clickOutsideToClose}
    <form method="dialog" class="modal-backdrop">
      <button type="submit">close</button>
    </form>
  {/if}
</dialog>

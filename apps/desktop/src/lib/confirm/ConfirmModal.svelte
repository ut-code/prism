<script lang="ts">
  import { confirmManager } from "./confirm.svelte.ts";

  let dialog: HTMLDialogElement | null = $state(null);

  $effect(() => {
    if (confirmManager.state.isOpen) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  });
</script>

<dialog
  bind:this={dialog}
  class="modal"
  onclose={() => confirmManager.handleCancel()}
>
  <div class="modal-box">
    <h3 class="text-lg font-bold">{confirmManager.state.title}</h3>
    <p class="py-4">{confirmManager.state.message}</p>
    <div class="modal-action">
      <button
        type="button"
        class="btn btn-ghost"
        onclick={() => confirmManager.handleCancel()}
      >
        {confirmManager.state.cancelText}
      </button>
      <button
        type="button"
        class={[
          "btn",
          confirmManager.state.variant === "danger"
            ? "btn-error"
            : "btn-primary",
        ]}
        onclick={() => confirmManager.handleConfirm()}
      >
        {confirmManager.state.confirmText}
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button type="submit">close</button>
  </form>
</dialog>

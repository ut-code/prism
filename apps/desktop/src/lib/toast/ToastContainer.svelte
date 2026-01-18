<script lang="ts">
  import CircleAlert from "@lucide/svelte/icons/circle-alert";
  import CircleCheck from "@lucide/svelte/icons/circle-check";
  import Info from "@lucide/svelte/icons/info";
  import { getToasts } from "./toast.svelte.ts";

  const toasts = $derived(getToasts());
</script>

<div class="toast toast-end toast-bottom z-50">
  {#each toasts as toast (toast.id)}
    <div
      class={[
        "alert",
        toast.type === "success" && "alert-success",
        toast.type === "error" && "alert-error",
        toast.type === "info" && "alert-info",
      ]}
    >
      {#if toast.type === "success"}
        <CircleCheck class="size-5" />
      {:else if toast.type === "error"}
        <CircleAlert class="size-5" />
      {:else}
        <Info class="size-5" />
      {/if}
      <span>{toast.message}</span>
    </div>
  {/each}
</div>

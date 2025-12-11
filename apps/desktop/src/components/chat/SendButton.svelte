<script lang="ts">
  interface Props {
    disabled: boolean;
    processing: boolean;
    onclick: () => void;
  }

  let { disabled, processing, onclick }: Props = $props();
</script>

<!--
  Send button with loading state.
  Displays a spinner when processing the message send operation.
-->
<button class="btn btn-primary self-end" {onclick} {disabled}>
  {#if processing}
    <span class="loading loading-spinner loading-sm"></span>
  {:else}
    送信
  {/if}
</button>

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
<button
  class="btn btn-primary btn-sm self-end"
  {onclick}
  {disabled}
  aria-label="Send message"
>
  {#if processing}
    <span class="loading loading-spinner loading-sm"></span>
  {:else}
    Send
  {/if}
</button>

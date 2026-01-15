<script lang="ts">
  interface Props {
    onclick: (e: MouseEvent) => void;
  }

  let { onclick }: Props = $props();
</script>

<!--
  Button to toggle the emoji palette.
  Displays a smiling face emoji icon.
-->
<button
  class="btn btn-ghost btn-sm self-end"
  {onclick}
  aria-label="Open emoji picker"
>
  😀
</button>

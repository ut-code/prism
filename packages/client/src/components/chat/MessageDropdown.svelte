<script lang="ts">
  import type { Snippet } from "svelte";

  const {
    children,
    x,
    y,
    visible,
  }: { children: Snippet; x: number; y: number; visible: boolean } = $props();
</script>

{#if visible}
  <div style={`top: ${y}px; left: ${x}px;}`} class="absolute z-10">
    {@render children()}
  </div>
{/if}

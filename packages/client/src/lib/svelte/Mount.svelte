<script lang="ts">
  interface Props {
    element: HTMLElement | null;
  }
  let { element = $bindable() }: Props = $props();

  let mountPoint = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (mountPoint && element) {
      mountPoint.appendChild(element);
      return () => {
        mountPoint?.removeChild(element);
      };
    }
  });
</script>

<div bind:this={mountPoint}></div>

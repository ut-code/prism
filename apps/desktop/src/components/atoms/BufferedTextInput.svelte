<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = Omit<HTMLInputAttributes, "type" | "value"> & {
    value: string;
  };
  let { value: source = $bindable(), ...props }: Props = $props();

  let buffer = $derived(source);
</script>

<input
  type="text"
  bind:value={
    () => buffer,
    (val) => {
      buffer = val;
      source = val;
    }
  }
  {...props}
/>

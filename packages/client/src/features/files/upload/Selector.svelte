<script lang="ts">
  import type { Id } from "@packages/convex";
  import { SelectorController } from "./Selector.svelte.ts";
  import SelectorDropzone from "./SelectorDropzone.svelte";

  interface Props {
    organizationId: Id<"organizations">;
    files: File[];
    onselect?: (files: File[]) => void;
    multiple?: boolean;
    disabled?: boolean;
  }

  const {
    organizationId,
    multiple = true,
    files = $bindable(),
    disabled = false,
    onselect,
  }: Props = $props();

  const controller = new SelectorController(() => ({
    organizationId,
    onselect(f) {
      files.push(...f);
      onselect?.(files);
    },
    multiple,
    disabled,
  }));
</script>

<div class="space-y-4">
  <SelectorDropzone {controller} />
</div>

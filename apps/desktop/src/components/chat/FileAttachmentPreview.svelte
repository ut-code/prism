<script lang="ts">
  import FilePreview from "@/features/files/upload/FilePreview.svelte";

  interface Props {
    files: File[];
    onremove: (index: number) => void;
  }

  let { files, onremove }: Props = $props();
</script>

<!--
  Displays a grid of attached file previews with remove buttons.
  Used in the message input to show files before sending.
-->
{#if files.length > 0}
  <div class="space-y-2">
    <h4 class="text-base-content/70 text-sm font-medium">添付ファイル:</h4>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {#each files as file, index (file.name)}
        <FilePreview
          {file}
          compact={true}
          removable={true}
          onRemove={() => onremove(index)}
        />
      {/each}
    </div>
  </div>
{/if}

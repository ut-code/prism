<script lang="ts">
  import { FilePreviewController } from "@/features/files/upload/FilePreview.svelte.ts";
  import { getFileIcon } from "../utils.ts";
  import type { UploadProgress } from "./uploader.svelte.ts";

  interface Props {
    file: File | UploadProgress;
    removable?: boolean;
    compact?: boolean;
    onRemove?: () => void;
  }

  const {
    file,
    removable = false,
    compact = false,
    onRemove,
  }: Props = $props();
  const controller = new FilePreviewController(() => ({
    file,
    removable,
    compact,
    onRemove,
  }));
</script>

<div
  class={[
    "card card-compact bg-base-100 border-base-200 relative border shadow-sm",
    controller.compact ? "p-2" : "p-3",
  ]}
>
  <div class={["flex items-start", controller.compact ? "gap-2" : "gap-3"]}>
    {#if controller.isImage && controller.fileUrl}
      <div class="avatar">
        <div
          class={[
            "bg-base-200 h-16 w-16 rounded",
            controller.compact && "h-10 w-10",
          ]}
        >
          <img
            src={controller.fileUrl}
            alt={controller.fileName}
            class="h-full w-full rounded object-cover"
            loading="lazy"
          />
        </div>
      </div>
    {:else}
      <div
        class="bg-base-200 flex h-16 w-16 items-center justify-center rounded {controller.compact
          ? 'h-10 w-10'
          : ''}"
      >
        <span class="text-2xl {controller.compact ? 'text-lg' : ''}"
          >{getFileIcon(controller.mimeType)}</span
        >
      </div>
    {/if}

    <div class="min-w-0 flex-1 space-y-1">
      <div
        class={[
          "text-base-content truncate font-medium",
          controller.compact ? "text-xs" : "text-sm",
        ]}
        title={controller.fileName}
      >
        {controller.fileName}
      </div>
      <div
        class="text-base-content/60 flex flex-wrap items-center gap-2 text-xs"
      >
        <span class="font-mono">{controller.fileSize}</span>
        {#if !controller.compact}
          <span class="badge badge-ghost badge-xs">{controller.mimeType}</span>
        {/if}
      </div>
    </div>
  </div>

  {#if controller.removable}
    <button
      class={[
        "btn btn-circle btn-xs btn-error absolute -top-2 -right-2 shadow-sm",
        controller.compact && "-top-1 -right-1",
      ]}
      onclick={controller.handleRemove}
      title="Remove"
      type="button"
      aria-label="Remove file"
    >
      <svg
        class="h-3 w-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </button>
  {/if}
</div>

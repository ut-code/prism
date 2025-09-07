<script lang="ts">
  import { type Id } from "@packages/convex";

  interface FileInfo {
    id?: Id<"files">;
    filename: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    url?: string;
    width?: number;
    height?: number;
  }

  interface Props {
    file: File | FileInfo;
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

  // Computed properties
  const isImage = $derived(() => {
    const mimeType = "type" in file ? file.type : file.mimeType;
    return mimeType.startsWith("image/");
  });

  const fileSize = $derived(() => {
    const bytes = file.size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  });

  const fileName = $derived(() => {
    return "name" in file ? file.name : file.filename;
  });

  const fileUrl = $derived(() => {
    if ("url" in file && file.url) return file.url;
    if (file instanceof File) return URL.createObjectURL(file);
    return null;
  });

  const mimeType = $derived(() => {
    return "type" in file ? file.type : file.mimeType;
  });

  // File type icon
  function getFileIcon(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType === "application/pdf") return "📄";
    if (mimeType.startsWith("text/")) return "📝";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📄";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "📊";
    return "📎";
  }

  // Cleanup object URL when component is destroyed
  $effect(() => {
    if (file instanceof File) {
      const url = fileUrl();
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
  });
</script>

<div
  class="card card-compact bg-base-100 border-base-200 relative border shadow-sm {compact
    ? 'p-2'
    : 'p-3'}"
>
  <div class="flex items-start {compact ? 'gap-2' : 'gap-3'}">
    <!-- Image preview -->
    {#if isImage() && fileUrl()}
      <div class="avatar">
        <div class="bg-base-200 h-16 w-16 rounded {compact ? 'h-10 w-10' : ''}">
          <img
            src={fileUrl()}
            alt={fileName()}
            class="h-full w-full rounded object-cover"
            loading="lazy"
          />
        </div>
      </div>
    {:else}
      <!-- File icon -->
      <div
        class="bg-base-200 flex h-16 w-16 items-center justify-center rounded {compact
          ? 'h-10 w-10'
          : ''}"
      >
        <span class="text-2xl {compact ? 'text-lg' : ''}"
          >{getFileIcon(mimeType())}</span
        >
      </div>
    {/if}

    <!-- File info -->
    <div class="min-w-0 flex-1 space-y-1">
      <div
        class="text-base-content truncate font-medium {compact
          ? 'text-xs'
          : 'text-sm'}"
        title={fileName()}
      >
        {fileName()}
      </div>
      <div
        class="text-base-content/60 flex flex-wrap items-center gap-2 text-xs"
      >
        <span class="font-mono">{fileSize}</span>
        {#if !compact}
          <span class="badge badge-ghost badge-xs">{mimeType()}</span>
        {/if}
      </div>

      <!-- Dimensions for images -->
      {#if isImage() && "width" in file && file.width && file.height}
        <div class="text-base-content/60 text-xs">
          {file.width} × {file.height}px
        </div>
      {/if}
    </div>
  </div>

  <!-- Remove button -->
  {#if removable}
    <button
      class="btn btn-circle btn-xs btn-error absolute -top-2 -right-2 shadow-sm {compact
        ? '-top-1 -right-1'
        : ''}"
      onclick={onRemove}
      title="削除"
      type="button"
      aria-label="ファイルを削除"
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

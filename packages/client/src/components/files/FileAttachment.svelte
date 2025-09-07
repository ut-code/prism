<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useQuery } from "convex-svelte";

  interface Props {
    fileId: Id<"files">;
    compact?: boolean;
    showPreview?: boolean;
  }

  const { fileId, compact = false, showPreview = true }: Props = $props();

  // Query file data
  const fileData = useQuery(api.files.getFile, () => ({ fileId }));

  // Computed properties
  const isLoading = $derived(fileData?.isLoading ?? true);
  const file = $derived(fileData?.data);
  const isImage = $derived(() => file?.mimeType?.startsWith("image/") ?? false);
  const shouldShowImagePreview = $derived(showPreview && isImage());

  // File type utilities
  function getFileIcon(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType === "application/pdf") return "📄";
    if (mimeType.startsWith("text/")) return "📝";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📄";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "📊";
    return "📎";
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleDownload() {
    if (!file?.url) return;

    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.originalFilename || file.filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleImageClick() {
    if (!file?.url || !isImage) return;

    // Open image in new tab
    window.open(file.url, "_blank");
  }
</script>

{#if isLoading}
  <!-- Skeleton loading -->
  <div
    class="flex animate-pulse items-center {compact
      ? 'gap-2 p-2'
      : 'gap-3 p-3'}"
  >
    <div
      class="skeleton bg-base-300 h-10 w-10 rounded {compact ? 'h-8 w-8' : ''}"
    ></div>
    <div class="flex-1 space-y-2">
      <div class="skeleton bg-base-300 h-3 w-3/4"></div>
      <div class="skeleton bg-base-300 h-2 w-1/2"></div>
    </div>
  </div>
{:else if file}
  <div class="inline-block {compact ? 'max-w-xs' : 'max-w-sm'}">
    {#if shouldShowImagePreview}
      <!-- Image preview -->
      <div class="card bg-base-100 relative overflow-hidden shadow-sm">
        <button
          class="group relative block w-full cursor-pointer"
          onclick={handleImageClick}
          title="クリックして拡大表示"
          type="button"
        >
          <img
            src={file.url}
            alt={file.originalFilename}
            class="w-full object-cover {compact ? 'max-h-32' : 'max-h-64'}"
            loading="lazy"
          />
          <div
            class="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-opacity group-hover:opacity-100"
          >
            <svg
              class="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              ></path>
            </svg>
          </div>
        </button>

        <!-- Image info overlay -->
        {#if !compact}
          <div
            class="absolute right-0 bottom-0 left-0 flex items-end justify-between bg-gradient-to-t from-black to-transparent p-3 text-white"
          >
            <div class="min-w-0 flex-1">
              <span
                class="block truncate text-sm font-medium"
                title={file.originalFilename}
              >
                {file.originalFilename}
              </span>
              <div class="space-x-2 text-xs text-gray-300">
                <span>{formatFileSize(file.size)}</span>
                {#if file.width && file.height}
                  <span>{file.width}×{file.height}</span>
                {/if}
              </div>
            </div>
            <button
              class="btn btn-ghost btn-xs bg-opacity-20 hover:bg-opacity-30 ml-2 bg-white"
              onclick={handleDownload}
              title="ダウンロード"
              type="button"
              aria-label="ファイルをダウンロード"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </button>
          </div>
        {/if}
      </div>
    {:else}
      <!-- File attachment -->
      <div
        class="card card-compact bg-base-200 hover:bg-base-300 transition-colors"
      >
        <div
          class="card-body flex-row items-center {compact
            ? 'gap-2 p-2'
            : 'gap-3 p-3'}"
        >
          <div class="avatar placeholder">
            <div
              class="bg-base-100 text-base-content h-10 w-10 rounded {compact
                ? 'h-8 w-8'
                : ''}"
            >
              <span class={compact ? "text-base" : "text-lg"}
                >{getFileIcon(file.mimeType)}</span
              >
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <div
              class="text-base-content truncate font-medium {compact
                ? 'text-xs'
                : 'text-sm'}"
              title={file.originalFilename}
            >
              {file.originalFilename}
            </div>
            <div class="text-base-content/60 space-x-2 text-xs">
              <span class="font-mono">{formatFileSize(file.size)}</span>
              {#if !compact}
                <span class="badge badge-ghost badge-xs">{file.mimeType}</span>
              {/if}
            </div>
          </div>

          <button
            class="btn btn-ghost btn-sm"
            onclick={handleDownload}
            title="ダウンロード"
            type="button"
            aria-label="ファイルをダウンロード"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <!-- Error state -->
  <div class="alert alert-error {compact ? 'p-2' : 'p-3'}">
    <span>⚠️</span>
    <span class={compact ? "text-xs" : "text-sm"}
      >ファイルを読み込めませんでした</span
    >
  </div>
{/if}

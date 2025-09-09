<script lang="ts">
  import { type Id } from "@packages/convex";
  import { formatFileSize, getFileIcon } from "../utils.ts";
  import { FileAttachmentController } from "./FileAttachment.svelte.ts";

  interface Props {
    fileId: Id<"files">;
    compact?: boolean;
    showPreview?: boolean;
  }

  const { fileId, compact = false, showPreview = true }: Props = $props();
  const controller = new FileAttachmentController(() => ({
    fileId,
    compact,
    showPreview,
  }));
</script>

{#if controller.isLoading}
  <div
    class="flex animate-pulse items-center {controller.compact
      ? 'gap-2 p-2'
      : 'gap-3 p-3'}"
  >
    <div
      class="skeleton bg-base-300 h-10 w-10 rounded {controller.compact
        ? 'h-8 w-8'
        : ''}"
    ></div>
    <div class="flex-1 space-y-2">
      <div class="skeleton bg-base-300 h-3 w-3/4"></div>
      <div class="skeleton bg-base-300 h-2 w-1/2"></div>
    </div>
  </div>
{:else if controller.fileData}
  <div class="inline-block {controller.compact ? 'max-w-xs' : 'max-w-sm'}">
    {#if controller.shouldShowImagePreview}
      <div class="card bg-base-100 relative overflow-hidden shadow-sm">
        <button
          class="group relative block w-full cursor-pointer"
          onclick={controller.handleImageClick}
          title="クリックして拡大表示"
          type="button"
        >
          <img
            src={controller.fileData.url}
            alt={controller.fileData.originalFilename}
            class="w-full object-cover {controller.compact
              ? 'max-h-32'
              : 'max-h-64'}"
            loading="lazy"
          />
          <div
            class="bg-opacity-0 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
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
      </div>
    {:else}
      <div
        class="card card-compact bg-base-200 hover:bg-base-300 transition-colors"
      >
        <div
          class="card-body flex-row items-center {controller.compact
            ? 'gap-2 p-2'
            : 'gap-3 p-3'}"
        >
          <div class="avatar placeholder">
            <div
              class="bg-base-100 text-base-content h-10 w-10 rounded {controller.compact
                ? 'h-8 w-8'
                : ''}"
            >
              <span class={controller.compact ? "text-base" : "text-lg"}>
                {getFileIcon(controller.fileData.mimeType)}
              </span>
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div
              class="text-base-content truncate font-medium {controller.compact
                ? 'text-xs'
                : 'text-sm'}"
              title={controller.fileData.originalFilename}
            >
              {controller.fileData.originalFilename}
            </div>
            <div class="text-base-content/60 space-x-2 text-xs">
              <span class="font-mono"
                >{formatFileSize(controller.fileData.size)}</span
              >
            </div>
          </div>
          <button
            class="btn btn-ghost btn-sm"
            onclick={controller.handleDownload}
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
  <div class="alert alert-error {controller.compact ? 'p-2' : 'p-3'}">
    <span>⚠️</span>
    <span class={controller.compact ? "text-xs" : "text-sm"}
      >ファイルを読み込めませんでした</span
    >
  </div>
{/if}

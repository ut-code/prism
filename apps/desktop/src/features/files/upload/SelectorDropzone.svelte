<script lang="ts">
  import { formatFileSize } from "../utils.ts";
  import type { SelectorController } from "./Selector.svelte.ts";
  import {
    ALLOWED_TYPES,
    MAX_FILE_SIZE,
    MAX_FILES,
  } from "./uploader.svelte.ts";

  interface Props {
    controller: SelectorController;
  }

  const { controller }: Props = $props();
</script>

<div class="file-uploader">
  <input
    bind:this={controller.fileInput}
    type="file"
    multiple={controller.multiple}
    accept={ALLOWED_TYPES.join(",")}
    class="hidden"
    onchange={controller.handleFileSelect}
  />

  <div
    class={[
      "card bg-base-100 border-base-300 hover:border-primary hover:bg-base-200 cursor-pointer border-2 border-dashed p-8 text-center transition-all",
      controller.isDragOver && "border-primary bg-primary/10",
      // controller.disabled && "pointer-events-none cursor-not-allowed opacity-50",
    ]}
    ondragover={controller.handleDragOver}
    ondragleave={controller.handleDragLeave}
    ondrop={controller.handleDrop}
    onclick={controller.handleClick}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === "Enter" && controller.handleClick()}
  >
    <div class="space-y-2">
      <div class="flex justify-center">
        <svg
          class="text-base-content/40 h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path>
        </svg>
      </div>
      <p class="text-base-content/70 text-sm">
        ファイルをドラッグ&ドロップ または <span
          class="text-primary font-medium">クリックして選択</span
        >
      </p>
      <p class="text-base-content/60 text-xs">
        最大{MAX_FILES}ファイル、{formatFileSize(MAX_FILE_SIZE)}まで
      </p>
    </div>
  </div>
</div>

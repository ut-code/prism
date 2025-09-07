<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import { useMutation } from "~/lib/useMutation.svelte.ts";

  interface Props {
    organizationId: Id<"organizations">;
    onUpload?: (files: UploadedFile[]) => void;
    multiple?: boolean;
    disabled?: boolean;
  }

  interface UploadedFile {
    id: Id<"files">;
    filename: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    url?: string;
  }

  interface UploadProgress {
    file: File;
    progress: number;
    status: "uploading" | "processing" | "completed" | "error";
    error?: string;
    result?: UploadedFile;
  }

  const {
    organizationId,
    onUpload,
    multiple = true,
    disabled = false,
  }: Props = $props();

  // Mutations
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFileInfo = useMutation(api.files.saveFileInfo);

  // State
  let isDragOver = $state(false);
  let uploadsInProgress = $state<UploadProgress[]>([]);
  let fileInput = $state<HTMLInputElement>();

  // Constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 5;
  const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/json",
    "text/csv",
  ];

  // Utility functions
  function validateFiles(files: File[]): { valid: File[]; errors: string[] } {
    const valid: File[] = [];
    const errors: string[] = [];

    if (files.length > MAX_FILES) {
      errors.push(`最大${MAX_FILES}ファイルまでアップロード可能です`);
      return { valid: [], errors };
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: ファイルサイズが大きすぎます（最大10MB）`);
        continue;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: サポートされていないファイル形式です`);
        continue;
      }

      valid.push(file);
    }

    return { valid, errors };
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getImageDimensions(
    file: File,
  ): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  // Upload logic
  async function uploadFile(file: File): Promise<UploadedFile> {
    // Get upload URL
    const uploadUrl = await generateUploadUrl.run({ organizationId });
    if (!uploadUrl) {
      throw new Error("アップロードURLの取得に失敗しました");
    }

    // Upload to Convex storage
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error("アップロードに失敗しました");
    }

    const { storageId } = await response.json();

    // Get image dimensions if applicable
    const dimensions = await getImageDimensions(file);

    // Save file info to database
    const fileId = await saveFileInfo.run({
      storageId,
      filename: file.name,
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
      organizationId,
      width: dimensions?.width,
      height: dimensions?.height,
    });
    if (!fileId) {
      throw new Error("ファイル情報の保存に失敗しました");
    }

    return {
      id: fileId,
      filename: file.name,
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
    };
  }

  async function processFiles(files: File[]) {
    if (disabled) return;

    const { valid, errors } = validateFiles(files);

    // Show validation errors
    if (errors.length > 0) {
      alert(errors.join("\n"));
      if (valid.length === 0) return;
    }

    // Initialize upload progress tracking
    const progressEntries: UploadProgress[] = valid.map((file) => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }));

    uploadsInProgress = [...uploadsInProgress, ...progressEntries];

    // Process uploads
    const uploadPromises = progressEntries.map(async (entry, _index) => {
      try {
        entry.status = "uploading";
        entry.progress = 10; // Initial progress

        const result = await uploadFile(entry.file);

        entry.progress = 100;
        entry.status = "completed";
        entry.result = result;

        return result;
      } catch (error) {
        entry.status = "error";
        entry.error =
          error instanceof Error ? error.message : "アップロードに失敗しました";
        throw error;
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successful = results
        .filter(
          (result): result is PromiseFulfilledResult<UploadedFile> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      if (successful.length > 0) {
        onUpload?.(successful);
      }

      // Clean up completed uploads after a delay
      setTimeout(() => {
        uploadsInProgress = uploadsInProgress.filter(
          (upload) => upload.status === "uploading",
        );
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
    }
  }

  // Event handlers
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
    // Reset input
    input.value = "";
  }

  function handleClick() {
    if (!disabled) {
      fileInput?.click();
    }
  }

  function removeUpload(index: number) {
    uploadsInProgress = uploadsInProgress.filter((_, i) => i !== index);
  }
</script>

<div class="file-uploader">
  <!-- Hidden file input -->
  <input
    bind:this={fileInput}
    type="file"
    {multiple}
    accept={ALLOWED_TYPES.join(",")}
    class="hidden"
    onchange={handleFileSelect}
  />

  <!-- Upload area -->
  <div
    class="card bg-base-100 border-base-300 hover:border-primary hover:bg-base-200 cursor-pointer border-2 border-dashed p-8 text-center transition-all {isDragOver
      ? 'border-primary bg-primary/10'
      : ''} {disabled
      ? 'pointer-events-none cursor-not-allowed opacity-50'
      : ''}"
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    onclick={handleClick}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === "Enter" && handleClick()}
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

  <!-- Upload progress -->
  {#if uploadsInProgress.length > 0}
    <div class="card bg-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm">アップロード中...</h3>
        <div class="space-y-3">
          {#each uploadsInProgress as upload, i}
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm">
                <span class="text-base-content flex-1 truncate font-medium"
                  >{upload.file.name}</span
                >
                <span class="text-base-content/60"
                  >({formatFileSize(upload.file.size)})</span
                >
                {#if upload.status === "error"}
                  <button
                    class="btn btn-ghost btn-xs text-error"
                    onclick={() => removeUpload(i)}
                    title="削除"
                    aria-label="アップロードを削除"
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
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                {/if}
              </div>

              {#if upload.status === "uploading"}
                <progress
                  class="progress progress-primary w-full"
                  value={upload.progress}
                  max="100"
                ></progress>
              {:else if upload.status === "completed"}
                <div class="badge badge-success badge-sm">完了</div>
              {:else if upload.status === "error"}
                <div class="badge badge-error badge-sm">{upload.error}</div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

import { getApiClient } from "@/lib/api.svelte";

export const MAX_FILES = 10;
// constants
export const MAX_FILE_SIZE = 30 * 1024 * 1024; // 10MB
export const ALLOWED_TYPES = [
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

export interface UploadedFile {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url?: string;
}

export interface UploadProgress {
  file: File;
  status: "queued" | "uploading" | "completed" | "error";
  error?: Error;
  result?: UploadedFile;
}

export class FileUploader {
  private api = getApiClient();
  private organizationId: string;
  uploading = $state(false);
  progress: UploadProgress[] = $state([]);

  constructor(
    props: () => {
      organizationId: string;
    },
  ) {
    this.organizationId = $derived(props().organizationId);
  }

  async uploadAll(files: File[]) {
    this.uploading = true;
    this.progress = files.map((f) => ({
      file: f,
      status: "queued",
    }));
    const uploaded: UploadedFile[] = [];
    for (const p of this.progress) {
      try {
        const result = await this.uploadFile(p.file);
        p.result = result;
        p.status = "completed";
        uploaded.push(result);
      } catch (err) {
        p.error = new Error("Failed to upload", {
          cause: err,
        });
        p.status = "error";
      }
    }
    this.uploading = false;
    return uploaded;
  }

  private async uploadFile(file: File): Promise<UploadedFile> {
    // For now, create a simple file upload directly via the API
    // In a real implementation, this would use a proper storage service
    const response = await this.api.files.post({
      storageId: `temp-${Date.now()}-${Math.random()}`, // Temporary storage ID
      filename: file.name,
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
      organizationId: this.organizationId,
    });

    if (response.error) {
      throw new Error(
        typeof response.error.value === "string"
          ? response.error.value
          : JSON.stringify(response.error.value),
      );
    }

    const fileData = response.data as any;
    return {
      id: fileData.id,
      filename: fileData.filename,
      originalFilename: fileData.originalFilename,
      mimeType: fileData.mimeType,
      size: fileData.size,
    };
  }
}

export function validate(...files: File[]) {
  const valid: File[] = [];
  const errors: Error[] = [];

  if (files.length > MAX_FILES) {
    errors.push(new Error(`最大${MAX_FILES}ファイルまでアップロード可能です`));
    return { valid: [], errors };
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(
        new Error(`${file.name}: ファイルサイズが大きすぎます（最大10MB）`),
      );
      continue;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(
        new Error(`${file.name}: サポートされていないファイル形式です`),
      );
      continue;
    }

    valid.push(file);
  }

  return { valid, errors };
}

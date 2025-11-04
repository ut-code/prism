import type { UploadProgress } from "./uploader.svelte.ts";

export interface FileInfo {
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url?: string;
  width?: number;
  height?: number;
}

export interface FilePreviewProps {
  file: File | UploadProgress;
  removable?: boolean;
  compact?: boolean;
  onRemove?: () => void;
}

export class FilePreviewController {
  file: File;
  removable: boolean;
  compact: boolean;
  onRemove?: () => void;

  isImage = $derived.by(() => this.mimeType.startsWith("image/"));

  fileSize = $derived.by(() => {
    const bytes = this.file.size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  });
  fileName = $derived.by(() => this.file.name);
  fileUrl = $state<string | null>(null);
  mimeType = $derived.by(() => this.file.type);
  progress = $derived.by(() => {
    const progress = this.props().file;
    if ("file" in progress) {
      return progress;
    }
    return undefined;
  });

  constructor(private props: () => FilePreviewProps) {
    this.file = $derived.by(() => {
      const f = props().file;
      if ("file" in f) {
        return f.file;
      } else {
        return f;
      }
    });
    this.removable = $derived(props().removable ?? false);
    this.compact = $derived(props().compact ?? false);
    this.onRemove = $derived(props().onRemove);

    $effect(() => {
      console.log("file", this.file);
      if (this.file instanceof File) {
        const url = URL.createObjectURL(this.file);
        this.fileUrl = url;
        return () => {
          URL.revokeObjectURL(url);
        };
      }
    });
  }

  handleRemove = () => {
    this.onRemove?.();
  };
}

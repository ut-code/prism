import { api, type Id } from "@apps/convex";
import { useQuery } from "convex-svelte";
import { isImage } from "../utils.ts";

export interface FileAttachmentProps {
  fileId: Id<"files">;
  compact?: boolean;
  showPreview?: boolean;
}

export class FileAttachmentController {
  fileId: Id<"files">;
  compact: boolean;
  showPreview: boolean;

  file = $derived(useQuery(api.files.getFile, () => ({ fileId: this.fileId })));
  fileData = $derived(this.file?.data);
  isLoading = $derived(this.file?.isLoading ?? true);
  isImage = $derived(isImage(this.fileData?.mimeType));
  shouldShowImagePreview = $derived.by(
    () => this.showPreview && this.isImage && !!this.fileData?.url,
  );

  constructor(props: () => FileAttachmentProps) {
    this.fileId = $derived(props().fileId);
    this.compact = $derived(props().compact ?? false);
    this.showPreview = $derived(props().showPreview ?? true);
  }

  handleDownload = () => {
    if (!this.fileData?.url) return;

    const link = document.createElement("a");
    link.href = this.fileData.url;
    link.download = this.fileData.originalFilename || this.fileData.filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  handleImageClick = () => {
    if (!this.fileData?.url || !this.isImage) return;
    window.open(this.fileData.url, "_blank");
  };
}

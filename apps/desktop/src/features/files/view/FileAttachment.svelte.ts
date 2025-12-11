import { getApiClient, useQuery } from "@/lib/api.svelte";
import { isImage } from "../utils.ts";

export interface FileAttachmentProps {
  fileId: string;
  compact?: boolean;
  showPreview?: boolean;
}

export class FileAttachmentController {
  fileId: string;
  compact: boolean;
  showPreview: boolean;

  #api = getApiClient();
  file = $derived(
    useQuery(async () => {
      const response = await (this.#api.files as any)[this.fileId].get();
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value),
        );
      }
      return response.data;
    }),
  );
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

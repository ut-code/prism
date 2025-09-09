export function isImage(mime?: string): boolean {
  if (!mime) return false;
  return mime.startsWith("image/");
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.startsWith("text/")) return "📝";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📄";
  if (mimeType.includes("excel") || mimeType.includes("sheet")) return "📊";
  return "📎";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

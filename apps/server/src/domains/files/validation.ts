/**
 * File validation constants and utilities.
 */

export const ALLOWED_MIME_TYPES = [
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

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates file size and mime type.
 * Returns error message if validation fails, null if valid.
 */
export function validateFile(size: number, mimeType: string): string | null {
  if (size > MAX_FILE_SIZE) {
    return "File size exceeds limit (max 10MB)";
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return "Unsupported file type";
  }

  return null;
}

/**
 * Sanitizes filename to prevent security issues.
 * Blocks path traversal attempts and hidden files.
 * Removes special characters and limits length.
 */
export function sanitizeFilename(filename: string): string {
  // Block path traversal attempts
  if (filename.includes("..")) {
    throw new Error("Filename cannot contain '..'");
  }

  // Block hidden files
  if (filename.startsWith(".")) {
    throw new Error("Filename cannot start with '.'");
  }

  // Block empty or whitespace-only filenames
  if (!filename.trim()) {
    throw new Error("Filename cannot be empty");
  }

  return filename
    .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF._-]/g, "_")
    .substring(0, 255);
}

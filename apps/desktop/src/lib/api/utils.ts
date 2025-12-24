import type { ApiErrorResponse } from "@packages/api-client";

/**
 * Helper function to extract data from Eden Treaty response
 * Throws exception for error responses or null data
 */
export function unwrapResponse<T>(response: {
  data?: unknown;
  error?: { status: unknown; value: unknown } | null;
}): T {
  // Eden Treaty error object
  if (response.error) {
    throw new Error(
      typeof response.error.value === "string"
        ? response.error.value
        : JSON.stringify(response.error.value),
    );
  }

  // Data is undefined or null
  if (response.data === undefined || response.data === null) {
    throw new Error("Response data is undefined or null");
  }

  // Detect server-side error response (supports new format)
  if (isApiErrorResponse(response.data)) {
    const error = response.data;
    const errorMessage = error.code
      ? `${error.message} (${error.code})`
      : error.message;
    throw new Error(errorMessage);
  }

  return response.data as T;
}

/**
 * Determine if object is ApiErrorResponse
 */
function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  if (typeof data !== "object" || data === null) return false;

  const obj = data as Record<string, unknown>;

  // message field is required
  if (typeof obj.message !== "string") return false;

  // code and details are optional
  const hasCode = !("code" in obj) || typeof obj.code === "string";
  const hasDetails = !("details" in obj) || obj.details !== undefined;

  // Conditions for error response:
  // 1. Has message field
  // 2. Has code or details field, or only message
  const keys = Object.keys(obj);
  const isErrorResponse =
    keys.includes("message") &&
    hasCode &&
    hasDetails &&
    keys.every((key) => ["message", "code", "details"].includes(key));

  return isErrorResponse;
}

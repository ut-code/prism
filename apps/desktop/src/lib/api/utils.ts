/**
 * Helper to unwrap Eden Treaty responses.
 * Throws an error if the response contains an error or null data.
 */
export function unwrapResponse<T>(response: {
  data?: T | null;
  error?: { status: number; value: unknown } | null;
}): T {
  if (response.error) {
    throw new Error(
      typeof response.error.value === "string"
        ? response.error.value
        : JSON.stringify(response.error.value),
    );
  }
  if (response.data === undefined || response.data === null) {
    throw new Error("Response data is undefined or null");
  }
  return response.data;
}

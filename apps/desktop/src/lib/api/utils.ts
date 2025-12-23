/**
 * Helper to unwrap Eden Treaty responses.
 * Throws an error if the response contains an error or null data.
 * Also handles server-side error responses with { message: string } format.
 */
export function unwrapResponse<T>(response: {
  data?: unknown;
  error?: { status: unknown; value: unknown } | null;
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
  // Handle server-side error responses
  if (
    typeof response.data === "object" &&
    response.data !== null &&
    "message" in response.data &&
    Object.keys(response.data).length === 1
  ) {
    throw new Error((response.data as { message: string }).message);
  }
  return response.data as T;
}

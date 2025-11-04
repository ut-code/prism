export const PUBLIC_CONVEX_URL = assert(
  "PUBLIC_CONVEX_URL",
  import.meta.env.PUBLIC_CONVEX_URL,
);

function assert(envName: string, val: string | undefined | null): string {
  if (val == null)
    throw new Error(`Environment variable not found: ${envName}`);
  return String(val);
}

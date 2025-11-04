export const AUTH_RESEND_KEY = assert(
  "AUTH_RESEND_KEY",
  process.env.AUTH_RESEND_KEY,
);

function assert(envName: string, val: string | undefined | null): string {
  if (val == null)
    throw new Error(`Environment variable not found: ${envName}`);
  return String(val);
}

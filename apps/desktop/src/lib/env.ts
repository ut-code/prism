import * as v from "valibot";

const envSchema = v.object({
  PUBLIC_API_BASE_URL: v.pipe(v.string(), v.url()),
  PUBLIC_DISABLE_AUTH: v.optional(v.string(), "false"),
});

const result = v.safeParse(envSchema, {
  PUBLIC_API_BASE_URL: import.meta.env.PUBLIC_API_BASE_URL,
  PUBLIC_DISABLE_AUTH: import.meta.env.PUBLIC_DISABLE_AUTH,
});

if (!result.success) {
  const issues = result.issues
    .map((i) => `  ${i.path?.[0]?.key}: ${i.message}`)
    .join("\n");
  throw new Error(`❌ Invalid environment variables:\n${issues}`);
}

export const env = result.output;

export const isAuthDisabled = () => env.PUBLIC_DISABLE_AUTH === "true";

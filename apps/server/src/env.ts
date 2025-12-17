import * as v from "valibot";

const envSchema = v.object({
  DATABASE_URL: v.pipe(v.string(), v.startsWith("postgres")),
  BETTER_AUTH_SECRET: v.pipe(v.string(), v.minLength(32)),
  CORS_ORIGIN: v.pipe(v.string(), v.url()),
  PORT: v.optional(v.pipe(v.string(), v.transform(Number)), "3000"),
  GOOGLE_CLIENT_ID: v.pipe(v.string(), v.minLength(1)),
  GOOGLE_CLIENT_SECRET: v.pipe(v.string(), v.minLength(1)),
  DISABLE_AUTH: v.optional(
    v.pipe(
      v.string(),
      v.transform((s) => s === "true"),
    ),
    "false",
  ),
});

const result = v.safeParse(envSchema, process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:");
  for (const issue of result.issues) {
    console.error(`  ${issue.path?.[0]?.key}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = result.output;

/**
 * E2E test environment configuration.
 * Uses isolated ports and Docker-based database.
 */
export const testEnv = {
  // Database (Docker container on port 5433)
  DATABASE_URL: "postgres://postgres:postgres@localhost:5433/postgres",
  DB_CONTAINER_NAME: "prism-test-db",
  DB_PORT: "5433",

  // Server
  PORT: "3001",
  SERVER_URL: "http://localhost:3001",

  // Frontend
  FRONTEND_PORT: "5174",
  FRONTEND_URL: "http://localhost:5174",

  // Auth (disabled for tests)
  DISABLE_AUTH: "true",
  PUBLIC_DISABLE_AUTH: "true",
  CORS_ORIGIN: "http://localhost:5174",
  PUBLIC_API_BASE_URL: "http://localhost:3001",

  // Dummy values for Better Auth (not used when DISABLE_AUTH=true)
  BETTER_AUTH_SECRET: "test-secret-key-at-least-32-characters-long",
  GOOGLE_CLIENT_ID: "test-client-id",
  GOOGLE_CLIENT_SECRET: "test-client-secret",
};

/**
 * Convert testEnv to process.env format
 */
export function getEnvString(): string {
  return Object.entries(testEnv)
    .filter(
      ([key]) =>
        ![
          "DB_CONTAINER_NAME",
          "DB_PORT",
          "SERVER_URL",
          "FRONTEND_URL",
          "FRONTEND_PORT",
        ].includes(key),
    )
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

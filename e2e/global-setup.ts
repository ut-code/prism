import { type ChildProcess, execSync, spawn } from "node:child_process";
import { testEnv } from "./env.ts";

const processes: ChildProcess[] = [];

/**
 * Get all test environment variables for subprocess
 */
function getTestEnvVars(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    DATABASE_URL: testEnv.DATABASE_URL,
    PORT: testEnv.PORT,
    CORS_ORIGIN: testEnv.CORS_ORIGIN,
    DISABLE_AUTH: testEnv.DISABLE_AUTH,
    PUBLIC_DISABLE_AUTH: testEnv.PUBLIC_DISABLE_AUTH,
    PUBLIC_API_BASE_URL: testEnv.PUBLIC_API_BASE_URL,
    BETTER_AUTH_SECRET: testEnv.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: testEnv.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: testEnv.GOOGLE_CLIENT_SECRET,
  };
}

/**
 * Wait for a URL to respond with 200 OK
 */
async function waitForUrl(url: string, timeout = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

/**
 * Wait for PostgreSQL to be ready
 */
async function waitForDb(timeout = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      execSync(
        `docker exec ${testEnv.DB_CONTAINER_NAME} pg_isready -U postgres`,
        { stdio: "ignore" },
      );
      return;
    } catch {
      // Not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Timeout waiting for database");
}

/**
 * Start PostgreSQL Docker container
 */
function startDatabase(): void {
  console.log("🐘 Starting test database...");

  // Remove existing container if any
  try {
    execSync(`docker rm -f ${testEnv.DB_CONTAINER_NAME}`, { stdio: "ignore" });
  } catch {
    // Container doesn't exist, that's fine
  }

  // Start new container
  execSync(
    `docker run -d --name ${testEnv.DB_CONTAINER_NAME} -p ${testEnv.DB_PORT}:5432 -e POSTGRES_PASSWORD=postgres postgres:16`,
    { stdio: "inherit" },
  );
}

/**
 * Run database migrations
 */
function runMigrations(): void {
  console.log("📦 Running migrations...");
  execSync("bun db:migrate", {
    cwd: "apps/server",
    stdio: "inherit",
    env: getTestEnvVars(),
  });
}

/**
 * Run database seed
 */
function runSeed(): void {
  console.log("🌱 Seeding database...");
  execSync("bun db:seed", {
    stdio: "inherit",
    env: getTestEnvVars(),
  });
}

/**
 * Start the API server
 */
function startServer(): ChildProcess {
  console.log("🦊 Starting server...");
  const server = spawn("bun", ["run", "src/index.ts"], {
    cwd: "apps/server",
    stdio: "inherit",
    env: getTestEnvVars(),
  });
  processes.push(server);
  return server;
}

/**
 * Start the frontend dev server
 */
function startFrontend(): ChildProcess {
  console.log("🌐 Starting frontend...");
  const frontend = spawn(
    "bun",
    ["vite", "dev", "--port", testEnv.FRONTEND_PORT],
    {
      cwd: "apps/desktop",
      stdio: "inherit",
      env: {
        ...process.env,
        PUBLIC_API_BASE_URL: testEnv.PUBLIC_API_BASE_URL,
        PUBLIC_DISABLE_AUTH: testEnv.PUBLIC_DISABLE_AUTH,
      },
    },
  );
  processes.push(frontend);
  return frontend;
}

/**
 * Global setup for Playwright tests
 */
export default async function globalSetup(): Promise<void> {
  console.log("\n🚀 Starting E2E test environment...\n");

  // 1. Start database
  startDatabase();
  await waitForDb();
  console.log("✅ Database ready");

  // 2. Run migrations and seed
  runMigrations();
  runSeed();
  console.log("✅ Database seeded");

  // 3. Start server
  startServer();
  await waitForUrl(`${testEnv.SERVER_URL}/health`);
  console.log("✅ Server ready");

  // 4. Start frontend
  startFrontend();
  await waitForUrl(testEnv.FRONTEND_URL);
  console.log("✅ Frontend ready");

  console.log("\n✨ E2E environment ready!\n");

  // Store process info for teardown
  (globalThis as Record<string, unknown>).__E2E_PROCESSES__ = processes;
}

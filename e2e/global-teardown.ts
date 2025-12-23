import { type ChildProcess, execSync } from "node:child_process";
import { testEnv } from "./env.ts";

/**
 * Global teardown for Playwright tests
 */
export default async function globalTeardown(): Promise<void> {
  console.log("\n🧹 Cleaning up E2E test environment...\n");

  // 1. Kill server and frontend processes
  const processes = (globalThis as Record<string, unknown>)
    .__E2E_PROCESSES__ as ChildProcess[] | undefined;
  if (processes) {
    for (const proc of processes) {
      if (proc && !proc.killed) {
        proc.kill("SIGTERM");
      }
    }
    console.log("✅ Processes terminated");
  }

  // 2. Stop and remove Docker container
  try {
    execSync(`docker rm -f ${testEnv.DB_CONTAINER_NAME}`, { stdio: "inherit" });
    console.log("✅ Database container removed");
  } catch {
    console.log("⚠️  Could not remove database container (may not exist)");
  }

  console.log("\n✨ Cleanup complete!\n");
}

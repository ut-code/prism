/// <reference types="vite" />
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import type { UserConfig } from "vite";

export default {
  plugins: [tailwindcss(), sveltekit()],
  // @ts-expect-error: we should use vitest/config, but it's not up to date with vite v7
  test: {
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "browser",
          environment: "happy-dom",
          include: ["{src,tests}/**/*.{test,spec}.{js,ts}"],
        },
      },
    ],
  },
} satisfies UserConfig;

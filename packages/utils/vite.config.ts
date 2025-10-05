/// <reference types="vite" />
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import type { UserConfig } from "vite";

export default {
  plugins: [tailwindcss(), sveltekit()],
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

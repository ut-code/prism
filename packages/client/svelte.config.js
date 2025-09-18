// @ts-check
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess({
    script: true,
  }),

  kit: {
    adapter: adapter({
      pages: "./dist",
      assets: "./dist",
      fallback: "index.html",
    }),
    outDir: "./.svelte-kit",
    paths: {
      relative: true,
    },
    alias: {
      "@@": "../..",
      $components: "src/components",
      "~": "src/",
    },
    env: {
      dir: "../..",
    },
  },
};

export default config;

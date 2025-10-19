// @ts-check
import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess({
    script: true,
  }),

  kit: {
    adapter: adapter(),
    outDir: "./.svelte-kit",
    alias: {
      "@@": "../..",
      $components: "src/components",
      "~": "src/",
    },
    env: {
      dir: "../..",
    },
  },
  compilerOptions: {
    runes: true,
  },
};

export default config;

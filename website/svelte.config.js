import { vitePreprocess } from "@astrojs/svelte";

/** @type {import('svelte').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Custom elements must not use self-closing tags in Svelte 5.
  },
};

export default config;

import { defineConfig } from "tsup";

const shared = {
  dts: true,
  sourcemap: false,
  treeshake: true,
  splitting: false,
  cjsInterop: true,
} as const;

export default defineConfig([
  {
    ...shared,
    entry: {
      index: "src/index.ts",
    },
    format: ["cjs", "esm"],
    clean: true,
    external: ["react", "react-dom", "dayjs"],
    esbuildOptions(options) {
      options.banner = {
        js: '"use client";',
      };
    },
  },
  {
    ...shared,
    entry: {
      "core/index": "src/core/index.ts",
      "vanilla/index": "src/vanilla/index.ts",
      "wc/index": "src/wc/index.ts",
      "vue/index": "src/framework/vue.ts",
      "svelte/index": "src/framework/svelte.ts",
      "angular/index": "src/framework/angular.ts",
    },
    format: ["cjs", "esm"],
    clean: false,
    external: ["dayjs", "react", "react-dom"],
  },
  {
    entry: {
      "cdn/universal-datetime-picker": "src/cdn.ts",
    },
    format: ["iife"],
    globalName: "UniversalDatetimePicker",
    clean: false,
    dts: false,
    minify: true,
    // Bundle dayjs into the CDN build
    noExternal: ["dayjs"],
    outExtension() {
      return { js: ".iife.js" };
    },
  },
]);

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import preact from "@astrojs/preact";
import solid from "@astrojs/solid-js";
import vue from "@astrojs/vue";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";

const root = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(root, "..");
const site =
  process.env.SITE_URL?.replace(/\/$/, "") ||
  "https://universal-datetime-picker.vercel.app";

const pkgAliases = [
  {
    find: "universal-datetime-picker/style.css",
    replacement: path.join(repoRoot, "src/styles/datepicker.scss"),
  },
  {
    find: "universal-datetime-picker/vanilla",
    replacement: path.join(repoRoot, "src/vanilla/index.ts"),
  },
  {
    find: "universal-datetime-picker/wc",
    replacement: path.join(repoRoot, "src/wc/index.ts"),
  },
  {
    find: "universal-datetime-picker/core",
    replacement: path.join(repoRoot, "src/core/index.ts"),
  },
  {
    find: "universal-datetime-picker/vue",
    replacement: path.join(repoRoot, "src/framework/vue.ts"),
  },
  {
    find: "universal-datetime-picker/svelte",
    replacement: path.join(repoRoot, "src/framework/svelte.ts"),
  },
  {
    find: "universal-datetime-picker/angular",
    replacement: path.join(repoRoot, "src/framework/angular.ts"),
  },
  {
    find: /^universal-datetime-picker$/,
    replacement: path.join(repoRoot, "src/index.ts"),
  },
];

export default defineConfig({
  site,
  root,
  srcDir: path.join(root, "src"),
  publicDir: path.join(root, "public"),
  outDir: path.resolve(root, "../site-dist"),
  integrations: [
    react({
      include: [
        "**/components/**",
        "**/demos/react/**",
        path.join(repoRoot, "src/**/*.tsx").replace(/\\/g, "/"),
      ],
    }),
    preact({ include: ["**/demos/preact/**"] }),
    solid({ include: ["**/demos/solid/**"] }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("datetime-picker"),
        },
      },
    }),
    svelte(),
    sitemap(),
  ],
  vite: {
    resolve: {
      alias: pkgAliases,
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["dayjs/locale/fr"],
    },
  },
});

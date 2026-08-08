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

/** Canonical production origin — must match the Search Console property. */
const DEFAULT_SITE = "https://universal-datetime-picker.vercel.app";
const LEGACY_SITE_HOSTS = ["react-calendar-time.vercel.app"];

function resolveSiteUrl() {
  const fromEnv = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (!fromEnv) {
    return DEFAULT_SITE;
  }
  // Ignore stale cutover env that still points at the redirected legacy host
  // (Google Search Console rejects sitemaps that 301 or use the wrong host).
  try {
    const host = new URL(fromEnv).host;
    if (LEGACY_SITE_HOSTS.includes(host)) {
      return DEFAULT_SITE;
    }
  } catch {
    return DEFAULT_SITE;
  }
  return fromEnv;
}

const site = resolveSiteUrl();

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
  // Astro 7 defaults to compressHTML: 'jsx', which strips newlines around
  // inline tags. That glues prose to links when <a> wraps to the next line.
  // HTML-aware compression keeps those newlines as spaces.
  compressHTML: true,
  // Match sitemap + <link rel="canonical"> (…/react/). Without this, Vercel
  // serves /react and /react/ as 200 duplicates; Google keeps the no-slash URL
  // as "Alternate page with proper canonical tag".
  trailingSlash: "always",
  // /sitemap.xml → /sitemap-index.xml is handled in vercel.json (Astro redirects
  // with trailingSlash:"always" would emit site-dist/sitemap.xml/index.html).
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
    sitemap({
      filter: (page) =>
        !page.includes("/demo/") && !page.endsWith("/sitemap.xml"),
      serialize(item) {
        const url = item.url.endsWith("/") ? item.url : `${item.url}/`;
        return { ...item, url };
      },
    }),
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

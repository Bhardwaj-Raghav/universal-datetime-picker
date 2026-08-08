import packageJson from "../../package.json";

export const SITE_NAME = "universal-datetime-picker";

export const PACKAGE_VERSION = packageJson.version;

/** Canonical public origin (no trailing slash). Used for sitemap, robots, and JSON-LD. */
export const SITE_ORIGIN = "https://universal-datetime-picker.vercel.app";

/** Primary SERP title — brand-first, multi-stack positioning. */
export const SITE_TITLE =
  "Universal DateTime Picker — Date & Time Picker for Any Framework";

/** Meta description: accurate product positioning (~155 chars). */
export const SITE_DESCRIPTION =
  "Open-source date and time picker for React, vanilla JS, Web Components, Vue, Svelte, and Angular. TypeScript, accessible calendar, ranges, themes, and dayjs locales.";

/** Short default keywords (pages should pass their own when relevant). */
export const SITE_KEYWORDS = [
  "date time picker",
  "date picker",
  "datetime picker",
  "react date picker",
  "date range picker",
  "web component date picker",
  "typescript date picker",
  "accessible date picker",
].join(", ");

/** Used in SoftwareApplication JSON-LD (home rich schema). */
export const SCHEMA_KEYWORDS = SITE_KEYWORDS;

export const GITHUB_URL =
  "https://github.com/Bhardwaj-Raghav/universal-datetime-picker";

export const NPM_URL =
  "https://www.npmjs.com/package/universal-datetime-picker";

/** jsDelivr serves tarball paths; npm `exports` subpaths like `/style.css` are not on the CDN. */
export const CDN_JS = `https://cdn.jsdelivr.net/npm/${SITE_NAME}@${PACKAGE_VERSION}/dist/cdn/universal-datetime-picker.iife.js`;

export const CDN_CSS = `https://cdn.jsdelivr.net/npm/${SITE_NAME}@${PACKAGE_VERSION}/dist/style.css`;

/** FAQ copy shared by the page and FAQPage JSON-LD. */
export const SITE_FAQS = [
  {
    question: "Is universal-datetime-picker a React date picker?",
    answer:
      "Yes. DateTime, DateTimeInput, and DateTimeRange are native React components on the main package entry. The same calendar core also ships as vanilla JS, Web Components, and thin Vue / Svelte / Angular registration helpers.",
  },
  {
    question: "Does it work without React?",
    answer:
      "Yes. Use universal-datetime-picker/vanilla for createDateTimePicker, or universal-datetime-picker/wc (and the CDN IIFE) for custom elements. React peers are optional when you stay on those entries.",
  },
  {
    question: "What is the support model for Solid and Preact?",
    answer:
      "Partial compatibility through Web Components only. There is no ./solid or ./preact package export. Register defineCustomElements from universal-datetime-picker/wc and render datetime-picker tags. Preact can also use preact/compat with the React entry if you prefer native React components.",
  },
  {
    question: "What does onChange return?",
    answer:
      "With asString omitted or false, date and datetime modes return a Date, and time mode returns a TimeValue object. Set asString to true for formatted strings. Date-only overlays commit on day click; datetime and time overlays commit when you press OK.",
  },
  {
    question: "What is the difference between inline, popover, and overlay?",
    answer:
      "Inline embeds the calendar in the page. Popover anchors the panel to an element (DateTimeInput always uses this). Overlay is a centered modal with a backdrop. Non-inline pickers default to open unless you set open or defaultOpen to false.",
  },
  {
    question: "Does DateTimeRange support popover anchoring?",
    answer:
      "No. DateTimeRange supports inline and modal open/close state, but it does not accept popover or anchorEl. Use a trigger button with open / onOpenChange if you need a closed-by-default range picker.",
  },
  {
    question: "How do locales work?",
    answer:
      "Pass a dayjs locale id such as fr or pt-br to the locale prop, and import that dayjs locale module first (for example import \"dayjs/locale/fr\"). Locale ids are dayjs module names, not arbitrary BCP-47 tags. UI chrome strings still use the labels prop.",
  },
  {
    question: "How do I use it from a CDN?",
    answer:
      "Load dist/style.css and dist/cdn/universal-datetime-picker.iife.js from jsDelivr or unpkg, then use <datetime-picker>, <datetime-picker-input>, or <datetime-picker-range>. Listen for the change CustomEvent; detail holds the selected value. Pin a version in production.",
  },
  {
    question: "Which package entry should I import?",
    answer:
      "universal-datetime-picker for React; ./vanilla for createDateTimePicker; ./wc for defineCustomElements; ./vue, ./svelte, or ./angular for registration helpers; ./core for headless controllers; ./style.css for styles.",
  },
  {
    question: "Is the calendar accessible?",
    answer:
      "Overlay pickers use dialog semantics, focus trapping, Escape to close, and arrow-key day navigation so keyboard and screen-reader users can select dates and times.",
  },
] as const;

export type DocsNavLink = { type?: "link"; href: string; label: string };
export type DocsNavHeading = { type: "heading"; label: string };
export type DocsNavItem = DocsNavLink | DocsNavHeading;

/** Sidebar navigation for /docs pages. */
export const DOCS_NAV: DocsNavItem[] = [
  { type: "heading", label: "Start" },
  { href: "/docs/", label: "Overview" },
  { href: "/docs/getting-started/", label: "Getting started" },
  { href: "/docs/entry-points/", label: "Entry points" },
  { type: "heading", label: "API" },
  { href: "/docs/components/", label: "Components" },
  { href: "/docs/props/", label: "Props" },
  { href: "/docs/overlay/", label: "Overlay & triggers" },
  { href: "/docs/range/", label: "Date range" },
  { href: "/docs/theming/", label: "Theming" },
  { href: "/docs/locales/", label: "Locales" },
  { type: "heading", label: "Integrate" },
  { href: "/docs/react/", label: "React" },
  { href: "/docs/nextjs/", label: "Next.js" },
  { href: "/docs/vanilla/", label: "Vanilla" },
  { href: "/docs/web-components/", label: "Web Components & CDN" },
  { href: "/docs/vue/", label: "Vue" },
  { href: "/docs/nuxt/", label: "Nuxt" },
  { href: "/docs/svelte/", label: "Svelte" },
  { href: "/docs/angular/", label: "Angular" },
  { href: "/docs/solid/", label: "Solid" },
  { href: "/docs/preact/", label: "Preact" },
  { type: "heading", label: "Help" },
  { href: "/docs/faq/", label: "FAQ" },
  { href: "/docs/troubleshooting/", label: "Troubleshooting" },
  { href: "/docs/migration/", label: "Migration" },
];

/** Path to a framework landing page. */
export function frameworkHref(slug: string): string {
  return `/${slug}/`;
}

/** Live demo URL for a docs framework page path (e.g. /docs/react/ → /react/). */
export function docsPathToDemoHref(docsPath: string): string | null {
  const map: Record<string, string> = {
    "/docs/react/": "/react/",
    "/docs/nextjs/": "/nextjs/",
    "/docs/vanilla/": "/vanilla/",
    "/docs/web-components/": "/web-components/",
    "/docs/vue/": "/vue/",
    "/docs/nuxt/": "/nuxt/",
    "/docs/svelte/": "/svelte/",
    "/docs/angular/": "/angular/",
    "/docs/solid/": "/solid/",
    "/docs/preact/": "/preact/",
  };
  return map[docsPath] ?? null;
}

/** Primary docs path for a framework landing. */
export function frameworkDocsHref(slug: string): string {
  switch (slug) {
    case "react":
      return "/docs/react/";
    case "nextjs":
      return "/docs/nextjs/";
    case "vanilla":
      return "/docs/vanilla/";
    case "web-components":
    case "cdn":
      return "/docs/web-components/";
    case "vue":
      return "/docs/vue/";
    case "nuxt":
      return "/docs/nuxt/";
    case "svelte":
      return "/docs/svelte/";
    case "angular":
      return "/docs/angular/";
    case "solid":
      return "/docs/solid/";
    case "preact":
      return "/docs/preact/";
    default:
      return "/docs/";
  }
}

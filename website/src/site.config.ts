import packageJson from "../../package.json";

export const SITE_NAME = "universal-datetime-picker";

export const PACKAGE_VERSION = packageJson.version;

/** Home SERP title — vanilla-first site; React and other stacks follow. */
export const SITE_TITLE =
  "Universal Date Time Picker — Vanilla, React, Vue, Svelte, Angular & CDN | universal-datetime-picker";

/** Meta description: vanilla-first home, then frameworks + CTA (~150–160 chars). */
export const SITE_DESCRIPTION =
  "Vanilla JS, React, Vue, Svelte, Angular, and CDN date/time/range picker in one package. TypeScript, dayjs locales, CSS themes. npm install universal-datetime-picker.";

/** Used in SoftwareApplication JSON-LD only (not meta keywords). */
export const SCHEMA_KEYWORDS = [
  "react date picker",
  "react datetime picker",
  "vue date picker",
  "svelte date picker",
  "angular date picker",
  "vanilla js date picker",
  "web component date picker",
  "date range picker",
  "typescript date picker",
  "accessible datepicker",
  "framework agnostic date picker",
  "universal-datetime-picker",
].join(", ");

/** @deprecated Meta keywords tag removed; kept for any legacy imports. */
export const SITE_KEYWORDS = SCHEMA_KEYWORDS;

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
    question: "Does universal-datetime-picker work outside React?",
    answer:
      "Yes. The same UI ships as Web Components and a vanilla createDateTimePicker API. Use universal-datetime-picker/wc or the CDN IIFE for Vue, Svelte, Angular, and plain HTML. React remains a first-class native wrapper over the shared core.",
  },
  {
    question:
      "What is the best framework-agnostic date time picker for TypeScript projects?",
    answer:
      "universal-datetime-picker is a typed date time picker with date, time, datetime, and date range modes. It ships ESM/CJS builds, CSS-variable theming, and a dayjs-powered API. React 18+ peers are optional.",
  },
  {
    question: "Does this date picker support date ranges and time selection?",
    answer:
      "Yes. Use DateTime for single date, time, or datetime picking, DateTimeInput for a popover input, and DateTimeRange for start/end date range selection — or the matching <datetime-picker>, <datetime-picker-input>, and <datetime-picker-range> custom elements.",
  },
  {
    question: "What does onChange return?",
    answer:
      'With asString={false} (or as-string="false" on elements), date and datetime modes return a native Date; time mode returns a TimeValue object { hour (1–12), hour24 (0–23), minute, second, ampm, formatted }. With asString={true} (or omitted today), you get a formatted string. Prefer setting asString explicitly.',
  },
  {
    question: "How do I use it from a CDN?",
    answer:
      "Load the stylesheet and the IIFE from jsDelivr or unpkg, then use <datetime-picker>, <datetime-picker-input>, or <datetime-picker-range>. Listen for the change CustomEvent; detail holds the selected value.",
  },
  {
    question: "Which package entry points should I import?",
    answer:
      "universal-datetime-picker for React; ./vanilla for createDateTimePicker; ./wc to defineCustomElements; ./vue, ./svelte, or ./angular for thin registration helpers; ./core for headless controllers; ./style.css for styles.",
  },
  {
    question: "Is universal-datetime-picker an accessible calendar component?",
    answer:
      "The picker uses dialog semantics, focus trapping, Escape to close, and arrow-key calendar navigation so keyboard and screen-reader users can select dates and times.",
  },
  {
    question: "How do I install from npm?",
    answer:
      "Run npm install universal-datetime-picker and import the entry for your stack. React peer dependencies are optional if you only use vanilla, Web Components, or CDN.",
  },
  {
    question: "Can I theme or localize this calendar picker?",
    answer:
      "Override CSS variables for light or dark themes, set locale with dayjs locale modules, choose 12-hour or 24-hour clocks, toggle seconds with showSeconds, and customize chrome labels without forking the component.",
  },
] as const;

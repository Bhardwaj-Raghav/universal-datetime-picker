import packageJson from "../../package.json";

export const SITE_NAME = "universal-datetime-picker";

export const PACKAGE_VERSION = packageJson.version;

/** Canonical public origin (no trailing slash). Used for sitemap, robots, and JSON-LD. */
export const SITE_ORIGIN = "https://universal-datetime-picker.vercel.app";

/** Primary SERP title — targets common “react date picker” / “date time picker” queries. */
export const SITE_TITLE =
  "React Date Picker & Date Time Picker — Universal, Vanilla, Vue, Svelte, Angular | universal-datetime-picker";

/** Meta description tuned for date picker / datetime picker search intent (~155 chars). */
export const SITE_DESCRIPTION =
  "Open-source React date picker and date time picker for every stack: vanilla JS, Vue, Svelte, Angular, Web Components, and CDN. TypeScript, accessible calendar, ranges, dayjs locales.";

/** Meta keywords (legacy signal; primary SEO is title, H1, copy, and structured data). */
export const SITE_KEYWORDS = [
  "react date picker",
  "react datetime picker",
  "react date time picker",
  "date picker",
  "date time picker",
  "datetime picker",
  "universal date picker",
  "universal datetime picker",
  "universal-datetime-picker",
  "typescript date picker",
  "accessible date picker",
  "date range picker",
  "vanilla js date picker",
  "vue date picker",
  "svelte date picker",
  "angular date picker",
  "web component date picker",
  "framework agnostic date picker",
  "calendar picker",
  "time picker",
].join(", ");

/** Used in SoftwareApplication JSON-LD. */
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
      "Yes. DateTime and DateTimeInput are native React components. The same calendar also ships for vanilla JS, Vue, Svelte, Angular, Web Components, and CDN via a shared core — one npm package, multiple entry points.",
  },
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
      "Yes. Use DateTime for single date, time, or datetime picking, DateTimeInput for a popover input with a calendar icon, and DateTimeRange for start/end date range selection — or the matching <datetime-picker>, <datetime-picker-input>, and <datetime-picker-range> custom elements.",
  },
  {
    question: "What does onChange return?",
    answer:
      "Omitting asString (or asString={false}) returns a native Date for date/datetime modes and a TimeValue object for time mode. Set asString={true} for formatted strings. Date-only overlays commit on day click; datetime and time overlays commit when you press OK. Month/year navigation stays inside min/max and past/future bounds, and the day grid always shows six weeks.",
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

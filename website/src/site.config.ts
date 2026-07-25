export const SITE_NAME = "react-calendar-time";

/** Primary SERP title (~55–65 chars before brand). Front-load high-intent queries. */
export const SITE_TITLE =
  "React Date Time Picker — Calendar, Time & Range | react-calendar-time";

/** Meta description: benefit + keywords + CTA. Keep ~150–160 chars for SERP. */
export const SITE_DESCRIPTION =
  "Free React date time picker with calendar, time, and date range modes. TypeScript, accessible, themable, dayjs-powered. Install react-calendar-time from npm.";

/**
 * Keyword list for meta keywords + structured data.
 * Targets common developer search queries for React date/time UI.
 */
export const SITE_KEYWORDS = [
  // Core product intent
  "react date picker",
  "react time picker",
  "react datetime picker",
  "react date time picker",
  "react date and time picker",
  "react calendar",
  "react calendar picker",
  "react calendar component",
  "react datepicker",
  "reactjs date picker",
  "reactjs datetime picker",
  "reactjs calendar",
  // Variants / spelling
  "react date-time picker",
  "react datetimepicker",
  "react datepicker component",
  "datetime picker react",
  "date time picker react",
  "date picker react",
  "time picker react",
  "calendar react component",
  // Feature / mode queries
  "react date range picker",
  "react daterangepicker",
  "react range calendar",
  "react date picker with time",
  "react calendar with time",
  "react time select",
  "react date input",
  "react date select",
  "react month picker",
  "inline date picker react",
  "popover date picker react",
  // Tech stack / quality
  "typescript date picker",
  "typescript react datepicker",
  "accessible datepicker",
  "a11y date picker react",
  "keyboard accessible calendar",
  "aria date picker",
  "dayjs date picker",
  "dayjs react calendar",
  "lightweight react date picker",
  "npm react date picker",
  "open source react datepicker",
  // Theming / UX
  "themable date picker",
  "css variable date picker",
  "dark mode date picker react",
  "12 hour time picker react",
  "localized date picker react",
  "i18n react datepicker",
  // Package / brand
  "react-calendar-time",
  "react calendar time",
].join(", ");

export const GITHUB_URL =
  "https://github.com/Bhardwaj-Raghav/react-calendar-time";

export const NPM_URL = "https://www.npmjs.com/package/react-calendar-time";

/** FAQ copy shared by the page and FAQPage JSON-LD. */
export const SITE_FAQS = [
  {
    question: "What is the best React date time picker for TypeScript projects?",
    answer:
      "react-calendar-time is a typed React date time picker with date, time, datetime, and date range modes. It ships ESM/CJS builds, CSS-variable theming, and a dayjs-powered API for React 17+.",
  },
  {
    question: "Does this React date picker support date ranges and time selection?",
    answer:
      "Yes. Use DateTime for single date, time, or datetime picking, DateTimeInput for a popover input, and DateTimeRange for start/end date range selection — all from one npm package.",
  },
  {
    question: "Is react-calendar-time an accessible React calendar component?",
    answer:
      "The picker uses dialog semantics, focus trapping, Escape to close, and arrow-key calendar navigation so keyboard and screen-reader users can select dates and times.",
  },
  {
    question: "How do I install a React datetime picker from npm?",
    answer:
      "Run npm install react-calendar-time, import DateTime or DateTimeInput, and load react-calendar-time/style.css. Peer dependencies are react and react-dom.",
  },
  {
    question: "Can I theme or localize this React calendar picker?",
    answer:
      "Override CSS variables for light or dark themes, set locale with dayjs locale modules, choose 12-hour or 24-hour clocks, and customize chrome labels without forking the component.",
  },
] as const;

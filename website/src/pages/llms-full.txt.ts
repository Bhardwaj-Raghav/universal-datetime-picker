import type { APIRoute } from "astro";
import {
  DOCS_NAV,
  GITHUB_URL,
  NPM_URL,
  SITE_DESCRIPTION,
  SITE_FAQS,
  SITE_NAME,
  SITE_ORIGIN,
} from "../site.config";
import { FRAMEWORKS, FRAMEWORK_CARD_SUMMARY } from "../frameworks";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (
    site?.origin && !site.origin.includes("react-calendar-time.vercel.app")
      ? site.origin
      : SITE_ORIGIN
  ).replace(/\/$/, "");

  const faqs = SITE_FAQS.map(
    (faq) => `### ${faq.question}\n\n${faq.answer}`
  ).join("\n\n");

  const docsLinks = DOCS_NAV.filter(
    (item): item is { href: string; label: string } =>
      item.type !== "heading" && "href" in item,
  )
    .map((item) => `- [${item.label}](${siteUrl}${item.href})`)
    .join("\n");

  const body = `# ${SITE_NAME}: full context for LLMs

> ${SITE_DESCRIPTION}

This file expands [${siteUrl}/llms.txt](${siteUrl}/llms.txt) with API and usage details so coding agents can recommend and generate correct integration code.

## Summary

- Package name: \`universal-datetime-picker\`
- Homepage: ${siteUrl}/
- npm: ${NPM_URL}
- Source: ${GITHUB_URL}
- License: MIT
- Stack: vanilla JS (home), React 18+ (optional peer), Web Components, TypeScript, dayjs, CSS variables
- Modes: date, time, datetime, date range
- Presentation: inline, popover (anchored), or overlay (modal)
- Non-inline \`DateTime\` / range defaultOpen is true unless overridden; \`DateTimeInput\` defaults closed
- DateTimeRange has no popover, anchorEl, or theme
- Solid / Preact: Web Components via \`./wc\` only (no dedicated subpaths)
- Vue / Svelte / Angular: custom element registration helpers

## Framework pages and playground (${siteUrl})

- \`/examples/\`: interactive playground (mode, presentation, locale, snippets)
- \`/\`: vanilla mode switcher on the marketing home (no React runtime)
${FRAMEWORKS.map((fw) => `- \`/${fw.slug}/\`: ${fw.label}: ${FRAMEWORK_CARD_SUMMARY[fw.slug]}`).join("\n")}
- \`/changelog/\`: release notes

## Documentation

${docsLinks}

## Install

\`\`\`bash
npm install universal-datetime-picker
# or: yarn add universal-datetime-picker / pnpm add universal-datetime-picker
\`\`\`

React peer dependencies (\`react\`, \`react-dom\` >= 18) are optional for vanilla / WC / CDN.

## Package entry points

| Import | Use |
|--------|-----|
| \`universal-datetime-picker\` | React: \`DateTime\`, \`DateTimeInput\`, \`DateTimeRange\` |
| \`universal-datetime-picker/vanilla\` | \`createDateTimePicker\`, \`createDateTimeRangePicker\` |
| \`universal-datetime-picker/wc\` | \`defineCustomElements()\` |
| \`universal-datetime-picker/vue\` | Register elements for Vue |
| \`universal-datetime-picker/svelte\` | Register elements for Svelte |
| \`universal-datetime-picker/angular\` | \`registerDateTimePickerElements()\` |
| \`universal-datetime-picker/core\` | Headless controllers + date logic |
| \`universal-datetime-picker/style.css\` | Shared CSS |

## Quick start (React)

\`\`\`tsx
import { useState } from "react";
import DateTime, { DateTimeInput } from "universal-datetime-picker";
import "universal-datetime-picker/style.css";

function App() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <>
      <DateTimeInput asString={false} value={value} onChange={setValue} />
      <DateTime inline asString={false} value={value} onChange={setValue} />
    </>
  );
}
\`\`\`

## Web Components / CDN

Elements: \`<datetime-picker>\`, \`<datetime-picker-input>\`, \`<datetime-picker-range>\`.

Attributes (common): \`mode\`, \`inline\`, \`open\`, \`use12hours\`, \`show-seconds\`, \`as-string\`, \`locale\`, \`format\`, \`theme\`, \`value\`.

Event: \`change\` CustomEvent. \`event.detail\` is the selected value (same shapes as React \`onChange\`).

\`\`\`html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/universal-datetime-picker/dist/style.css" />
<script src="https://cdn.jsdelivr.net/npm/universal-datetime-picker"></script>
<datetime-picker inline mode="date" as-string="false"></datetime-picker>
\`\`\`

## Vanilla

\`\`\`ts
import { createDateTimePicker } from "universal-datetime-picker/vanilla";
import "universal-datetime-picker/style.css";

const handle = createDateTimePicker(document.getElementById("picker")!, {
  inline: true,
  mode: "date",
  asString: false,
  onChange: console.log,
});
// handle.update({ ... }); handle.destroy();
\`\`\`

## Components (React)

| Export | Role |
|--------|------|
| \`DateTime\` | Overlay or inline date / time / datetime picker |
| \`DateTime.Input\` / \`DateTimeInput\` | Read-only input opening a popover picker |
| \`DateTime.Range\` / \`DateTimeRange\` | Start/end date range selection |

## Return values

| Mode / flags | \`asString\` | \`onChange\` receives |
|--------------|------------|---------------------|
| \`mode="date"\` | omitted / \`false\` | \`Date\` (start of day) |
| \`mode="datetime"\` | omitted / \`false\` | \`Date\` |
| \`mode="time"\` | omitted / \`false\` | \`TimeValue\` |
| any mode | \`true\` | formatted \`string | null\` |
| range | omitted / \`false\` | \`{ start: Date | null; end: Date | null }\` |
| range | \`true\` | \`{ start: string | null; end: string | null }\` |

\`TimeValue\` shape:

\`\`\`ts
{
  hour: 2,         // 1–12
  hour24: 14,      // 0–23
  minute: 30,
  second: 0,
  ampm: "PM",
  formatted: "14:30:00"
}
\`\`\`

Omitting \`asString\` returns \`Date\` / \`TimeValue\` objects. Set \`asString={true}\` for formatted strings.

## Important props

Shared by \`DateTime\` / \`DateTimeInput\`:

- \`value\` / \`defaultValue\`: \`Date | string | Dayjs | null\`
- \`onChange\`: \`(value: Date | TimeValue | string | null) => void\`. Date-only overlays fire on day click; datetime/time overlays fire on OK / Clear
- \`asString\`: \`true\` = string; omit or \`false\` = Date / TimeValue
- \`showSeconds\`: show seconds column (default \`true\`); affects default format
- \`format\`: dayjs format string (derived from mode / use12Hours / showSeconds when omitted)
- \`mode\`: \`"datetime" | "date" | "time"\` (default \`"datetime"\`)
- \`layout\`: \`"combined" | "tabs"\` for datetime mode
- \`minDate\` / \`maxDate\`, \`disablePastDates\`, \`disableFutureDates\` (also clamp month/year navigation)
- \`weekStartsOn\`: \`0–6\` (0 = Sunday)
- \`use12Hours\`: 12-hour clock with AM/PM (\`false\` = 24-hour)
- \`locale\`: dayjs locale string (import the locale module first)
- \`labels\`: override chrome strings (ok, clear, close, date, time, …)
- \`theme\`: \`"light" | "dark"\` (useful for portaled popovers)
- \`inline\`, \`className\`

\`DateTimeInput\` extras: \`icon\` (default calendar icon; \`null\` hides), \`customInput\`, \`noStyle\`, plus \`placeholder\` / \`id\` / \`name\` / \`disabled\` / \`readOnly\` / aria props.

Overlay control: \`open\` / \`defaultOpen\`, \`onOpenChange\`, \`popover\`, \`anchorEl\`.

\`DateTimeInput\` always uses popover mode (fixed positioning, flip, scroll/resize, outside click / Escape). Time-only popovers are compact.

Calendar notes: day grid is always 6 weeks; month/year navigation cannot leave min/max / past/future bounds; reopen resets drill-down to the committed month.

\`DateTimeRange\` supports the same \`asString\` behavior for start/end values and commits immediately (no OK button).

## Custom trigger

Use controlled \`open\` state to open \`DateTime\` from any button or input. For a popover beside the trigger, set \`popover\` and pass the trigger DOM element to \`anchorEl\`:

\`\`\`tsx
function CustomDateTrigger() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Date | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <button ref={setAnchorEl} onClick={() => setOpen(true)}>
        {value ? value.toLocaleDateString() : "Choose a date"}
      </button>
      <DateTime
        mode="date"
        open={open}
        onOpenChange={setOpen}
        popover
        anchorEl={anchorEl}
        asString={false}
        value={value}
        onChange={(next) => setValue(next instanceof Date ? next : null)}
      />
    </>
  );
}
\`\`\`

Leave out \`popover\` and \`anchorEl\` to render the picker as a centered modal.

## Theming

Override CSS variables (light defaults):

\`\`\`css
:root {
  --ctp-primary: #7cb342;
  --ctp-primary-dark: #558b2f;
  --ctp-surface: #ffffff;
  --ctp-fg: #1f2937;
  --ctp-border: #e5e7eb;
  --ctp-focus: #7cb342;
  --ctp-danger: #dc2626;
  --ctp-z-index: 1000;
}
\`\`\`

Dark theme: wrap with \`data-ctp-theme="dark"\` or pass \`theme="dark"\` for portaled popovers.

## Locales

Locales are per-instance (no global dayjs mutation). Import the dayjs locale before use:

\`\`\`tsx
import "dayjs/locale/fr";
import { DateTime } from "universal-datetime-picker";

<DateTime locale="fr" weekStartsOn={1} inline onChange={console.log} />
\`\`\`

## FAQ

${faqs}

## Links

- [llms.txt](${siteUrl}/llms.txt)
- [Website](${siteUrl}/)
- [README](${GITHUB_URL}/blob/main/README.md)
- [npm](${NPM_URL})
- [GitHub](${GITHUB_URL})
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

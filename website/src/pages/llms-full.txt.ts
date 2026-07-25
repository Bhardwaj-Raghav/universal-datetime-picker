import type { APIRoute } from "astro";
import {
  GITHUB_URL,
  NPM_URL,
  SITE_DESCRIPTION,
  SITE_FAQS,
  SITE_NAME,
} from "../site.config";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (site?.origin || "https://react-calendar-time.vercel.app").replace(
    /\/$/,
    ""
  );

  const faqs = SITE_FAQS.map(
    (faq) => `### ${faq.question}\n\n${faq.answer}`
  ).join("\n\n");

  const body = `# ${SITE_NAME} — full context for LLMs

> ${SITE_DESCRIPTION}

This file expands [${siteUrl}/llms.txt](${siteUrl}/llms.txt) with API and usage details so coding agents can recommend and generate correct integration code.

## Summary

- Package name: \`react-calendar-time\`
- Homepage: ${siteUrl}/
- npm: ${NPM_URL}
- Source: ${GITHUB_URL}
- License: MIT
- Stack: React 17+, TypeScript, dayjs, CSS variables
- Modes: date, time, datetime, date range
- Presentation: overlay, popover (input), or inline

## Install

\`\`\`bash
npm install react-calendar-time
# or: yarn add react-calendar-time / pnpm add react-calendar-time
\`\`\`

Peer dependencies: \`react\`, \`react-dom\` (>= 17).

## Quick start

\`\`\`tsx
import { useState } from "react";
import DateTime, { DateTimeInput } from "react-calendar-time";
import "react-calendar-time/style.css";

function App() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <>
      <DateTimeInput value={value} onChange={setValue} />
      <DateTime inline value={value} onChange={setValue} />
    </>
  );
}
\`\`\`

## Components

| Export | Role |
|--------|------|
| \`DateTime\` | Overlay or inline date / time / datetime picker |
| \`DateTime.Input\` / \`DateTimeInput\` | Read-only input opening a popover picker |
| \`DateTime.Range\` / \`DateTimeRange\` | Start/end date range selection |

## Important props

Shared by \`DateTime\` / \`DateTimeInput\`:

- \`value\` / \`defaultValue\`: \`Date | string | Dayjs | null\`
- \`onChange\`: \`(value: string | null) => void\` (fires on OK / Clear)
- \`format\`: dayjs format string (default \`YYYY-MM-DD HH:mm:ss\`)
- \`mode\`: \`"datetime" | "date" | "time"\` (default \`"datetime"\`)
- \`layout\`: \`"combined" | "tabs"\` for datetime mode
- \`minDate\` / \`maxDate\`, \`disablePastDates\`, \`disableFutureDates\`
- \`weekStartsOn\`: \`0–6\` (0 = Sunday)
- \`use12Hours\`: 12-hour clock with AM/PM
- \`locale\`: dayjs locale string (import the locale module first)
- \`labels\`: override chrome strings (ok, clear, close, date, time, …)
- \`theme\`: \`"light" | "dark"\` (useful for portaled popovers)
- \`inline\`, \`className\`

Overlay control: \`open\` / \`defaultOpen\`, \`onOpenChange\`, \`popover\`, \`anchorEl\`.

\`DateTimeInput\` always uses popover mode (fixed positioning, flip, scroll/resize, outside click / Escape).

\`DateTimeRange\` \`onChange\` receives \`{ start: string | null; end: string | null }\`.

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
import { DateTime } from "react-calendar-time";

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

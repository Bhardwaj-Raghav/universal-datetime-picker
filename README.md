[![npm](https://img.shields.io/npm/v/universal-datetime-picker.svg)](https://www.npmjs.com/package/universal-datetime-picker)
[![npm downloads](https://img.shields.io/npm/dm/universal-datetime-picker.svg)](https://www.npmjs.com/package/universal-datetime-picker)
[![types](https://img.shields.io/npm/types/universal-datetime-picker.svg)](https://www.npmjs.com/package/universal-datetime-picker)
[![CI](https://github.com/Bhardwaj-Raghav/universal-datetime-picker/actions/workflows/ci.yml/badge.svg)](https://github.com/Bhardwaj-Raghav/universal-datetime-picker/actions/workflows/ci.yml)
[![license](https://img.shields.io/github/license/Bhardwaj-Raghav/universal-datetime-picker)](https://github.com/Bhardwaj-Raghav/universal-datetime-picker/blob/main/LICENSE)

# universal-datetime-picker

Framework-agnostic **date picker**, **datetime picker**, and **date range calendar**. One accessible TypeScript package for React, Vue, Svelte, Angular, vanilla JS, Web Components, and CDN.

A headless core powers React components, a vanilla DOM renderer, and custom elements (`<datetime-picker>`, `<datetime-picker-input>`, `<datetime-picker-range>`).

- **Docs:** [Getting started](https://universal-datetime-picker.vercel.app/docs/getting-started/) · [full docs](https://universal-datetime-picker.vercel.app/docs/)
- **Examples:** [Playground](https://universal-datetime-picker.vercel.app/examples/)
- **Changelog:** [Release notes](https://universal-datetime-picker.vercel.app/changelog/)
- **GitHub:** [Bhardwaj-Raghav/universal-datetime-picker](https://github.com/Bhardwaj-Raghav/universal-datetime-picker)

## Features

- React components, Vue / Svelte / Angular via Web Components, vanilla JS, and CDN
- Date, time, datetime, and date-range pickers
- Input + popover or fully inline modes
- TypeScript types, ESM/CJS builds, React 18+ (optional peer)
- Accessible UI (dialog, focus trap, arrow-key navigation)
- Themable via CSS variables; dark theme; dayjs locales; 12-hour AM/PM

## Install

```bash
npm install universal-datetime-picker
```

Also works with `yarn add` / `pnpm add`. React peers (`react`, `react-dom` ≥ 18) are required only for the React entry. Vanilla, Web Components, and CDN need no React.

## Frameworks

| Stack | Guide |
|-------|-------|
| React | [Docs](https://universal-datetime-picker.vercel.app/docs/react/) · quick start below |
| Vanilla JS | [Docs](https://universal-datetime-picker.vercel.app/docs/vanilla/) · [demo](https://universal-datetime-picker.vercel.app/vanilla/) |
| Web Components / CDN | [Docs](https://universal-datetime-picker.vercel.app/docs/web-components/) · [CDN](https://universal-datetime-picker.vercel.app/cdn/) |
| Vue | [Docs](https://universal-datetime-picker.vercel.app/docs/vue/) · [demo](https://universal-datetime-picker.vercel.app/vue/) |
| Svelte | [Docs](https://universal-datetime-picker.vercel.app/docs/svelte/) · [demo](https://universal-datetime-picker.vercel.app/svelte/) |
| Angular | [Docs](https://universal-datetime-picker.vercel.app/docs/angular/) · [demo](https://universal-datetime-picker.vercel.app/angular/) |
| Next.js / Nuxt / Solid / Preact | [Docs index](https://universal-datetime-picker.vercel.app/docs/) |

## Quick start

### React

```tsx
import { useState } from "react";
import DateTime, { DateTimeInput } from "universal-datetime-picker";
import "universal-datetime-picker/style.css";

function App() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <>
      <DateTimeInput value={value} onChange={setValue} />
      <DateTime inline value={value} onChange={setValue} />
    </>
  );
}
```

### Vanilla JS

```ts
import { createDateTimePicker } from "universal-datetime-picker/vanilla";
import "universal-datetime-picker/style.css";

const handle = createDateTimePicker(document.getElementById("picker")!, {
  inline: true,
  mode: "date",
  asString: false,
  onChange: (value) => console.log(value),
});
```

### CDN

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/universal-datetime-picker/dist/style.css"
/>
<script src="https://cdn.jsdelivr.net/npm/universal-datetime-picker"></script>

<datetime-picker inline mode="date" as-string="false"></datetime-picker>
```

Props, return values, ranges, theming, and locales: [docs](https://universal-datetime-picker.vercel.app/docs/).

## Package entry points

| Import | Use for |
|--------|---------|
| `universal-datetime-picker` | React (`DateTime`, `DateTimeInput`, `DateTimeRange`) |
| `universal-datetime-picker/vanilla` | `createDateTimePicker` / `createDateTimeRangePicker` |
| `universal-datetime-picker/wc` | `defineCustomElements()` + custom element classes |
| `universal-datetime-picker/vue` | Vue registration helpers |
| `universal-datetime-picker/svelte` | Svelte registration / action |
| `universal-datetime-picker/angular` | `registerDateTimePickerElements()` |
| `universal-datetime-picker/core` | Headless controllers + date logic |
| `universal-datetime-picker/style.css` | Shared stylesheet |

Details: [entry points](https://universal-datetime-picker.vercel.app/docs/entry-points/).

## Screenshots

| Date only | Time only |
|-----------|-----------|
| ![Date picker calendar](https://raw.githubusercontent.com/Bhardwaj-Raghav/universal-datetime-picker/main/examples/date-only.png) | ![Time picker with hours, minutes, seconds](https://raw.githubusercontent.com/Bhardwaj-Raghav/universal-datetime-picker/main/examples/time-only.png) |

| Combined date & time | Separate view (tabs) |
|----------------------|----------------------|
| ![Datetime picker with calendar and time panel](https://raw.githubusercontent.com/Bhardwaj-Raghav/universal-datetime-picker/main/examples/date-time-combined.png) | ![Datetime picker with Date and Time tabs](https://raw.githubusercontent.com/Bhardwaj-Raghav/universal-datetime-picker/main/examples/date-time-split.png) |

| Date range | Dark theme |
|------------|------------|
| ![Date range picker with start and end selection](https://raw.githubusercontent.com/Bhardwaj-Raghav/universal-datetime-picker/main/examples/date-range.png) | ![Date time picker in dark theme](https://raw.githubusercontent.com/Bhardwaj-Raghav/universal-datetime-picker/main/examples/dark-mode.png) |

## Migrating from react-calendar-time

Renamed to **universal-datetime-picker** in v2.0.0. Swap the package name and import paths; Web Components are now `<datetime-picker>*`. Full steps: [migration guide](https://universal-datetime-picker.vercel.app/docs/migration/).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT

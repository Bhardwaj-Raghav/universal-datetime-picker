[![npm](https://img.shields.io/npm/v/react-calendar-time.svg)](https://www.npmjs.com/package/react-calendar-time)
[![npm downloads](https://img.shields.io/npm/dm/react-calendar-time.svg)](https://www.npmjs.com/package/react-calendar-time)
[![types](https://img.shields.io/npm/types/react-calendar-time.svg)](https://www.npmjs.com/package/react-calendar-time)
[![CI](https://github.com/Bhardwaj-Raghav/react-calendar-time/actions/workflows/ci.yml/badge.svg)](https://github.com/Bhardwaj-Raghav/react-calendar-time/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/react-calendar-time.svg)](https://github.com/Bhardwaj-Raghav/react-calendar-time/blob/main/LICENSE)

# react-calendar-time

**React date picker, time picker, datetime picker, and date range calendar** in one accessible TypeScript package.

Use it as a React calendar component, date-time input, or range selector — dayjs-powered values, CSS-variable themes (including dark mode), 12/24-hour clocks, and locales.

- **Live demo:** [react-calendar-time.vercel.app](https://react-calendar-time.vercel.app)
- **npm:** [react-calendar-time](https://www.npmjs.com/package/react-calendar-time)
- **GitHub:** [Bhardwaj-Raghav/react-calendar-time](https://github.com/Bhardwaj-Raghav/react-calendar-time)

## Features

- React date picker, time picker, and combined datetime picker
- Date range picker with keyboard-friendly calendar grid
- Input + popover or fully inline calendar modes
- TypeScript types, ESM/CJS builds, React 17+
- Accessible UI (dialog, focus trap, arrow-key navigation)
- Themable via CSS variables; dark theme support
- Locales via dayjs; custom labels; 12-hour AM/PM mode

## Install

```bash
npm install react-calendar-time
```

```bash
yarn add react-calendar-time
```

```bash
pnpm add react-calendar-time
```

Peer dependencies: `react` and `react-dom` (≥ 17).

## Screenshots

| Date only | Time only |
|-----------|-----------|
| ![React date picker calendar](examples/date-only.png) | ![React time picker with hours, minutes, seconds](examples/time-only.png) |

| Combined date & time | Separate view (tabs) |
|----------------------|----------------------|
| ![React datetime picker with calendar and time panel](examples/date-time-combined.png) | ![React datetime picker with Date and Time tabs](examples/date-time-split.png) |

| Date range | French locale · week starts Monday |
|------------|------------------------------------|
| ![React date range picker with start and end selection](examples/date-range.png) | ![Localized React calendar in French starting on Monday](examples/locale-date.png) |

| Dark theme | Popover input |
|------------|---------------|
| ![React date time picker in dark theme](examples/dark-mode.png) | ![React datetime input that opens a popover picker](examples/input.png) |

## Quick start

```tsx
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
```

## Components

| Export | Description |
|--------|-------------|
| `DateTime` | React datetime / date / time picker (overlay or inline) |
| `DateTime.Input` / `DateTimeInput` | Date time input that opens a popover calendar |
| `DateTime.Range` / `DateTimeRange` | React date range picker |

## Props

### Shared (`DateTime` / `DateTimeInput`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| string \| Dayjs \| null` | — | Controlled value |
| `defaultValue` | same | — | Uncontrolled initial value |
| `onChange` | `(value: string \| null) => void` | — | Fired on OK / Clear |
| `format` | `string` | `YYYY-MM-DD HH:mm:ss` | dayjs format |
| `mode` | `"datetime" \| "date" \| "time"` | `"datetime"` | Picker mode |
| `layout` | `"combined" \| "tabs"` | `"combined"` | When `mode="datetime"`: show both panels, or Date/Time tabs. Hidden for date-only / time-only |
| `minDate` / `maxDate` | date-like | — | Inclusive bounds |
| `disablePastDates` | `boolean` | `false` | Disable days before today |
| `disableFutureDates` | `boolean` | `false` | Disable days after today |
| `weekStartsOn` | `0–6` | `0` | First day of week (0 = Sunday) |
| `use12Hours` | `boolean` | `false` | 12-hour clock with AM/PM |
| `locale` | `string` | `"en"` | dayjs locale (import locale first) |
| `labels` | `DateTimeLabels` | English defaults | Override chrome strings |
| `theme` | `"light" \| "dark"` | — | Force theme (useful for portaled popovers) |
| `inline` | `boolean` | `false` | Render without overlay |
| `className` | `string` | — | Root class |

### Overlay control

| Prop | Type | Description |
|------|------|-------------|
| `open` / `defaultOpen` | `boolean` | Controlled / uncontrolled open state |
| `onOpenChange` | `(open: boolean) => void` | Open state changes |
| `popover` | `boolean` | Position near `anchorEl` instead of fullscreen |
| `anchorEl` | `HTMLElement \| null` | Anchor for popover |

`DateTimeInput` always uses popover mode. The popover uses `position: fixed`, flips above the input when needed, repositions on scroll/resize, and closes on outside click or Escape.

### `DateTimeInput` extras

`placeholder`, `id`, `name`, `disabled`, `readOnly`, `aria-label`, `aria-labelledby`, `inputClassName`

### `DateTimeRange`

`onChange` receives `{ start: string | null; end: string | null }`. Supports keyboard grid navigation, hover range preview, and the same `locale` / `weekStartsOn` / `labels` props.

### Labels

```tsx
<DateTime
  inline
  labels={{ ok: "Confirm", clear: "Wipe", close: "Dismiss", date: "Jour" }}
/>
```

### Layout

By default (`layout="combined"`), datetime mode shows the calendar and time controls together — no Date/Time badges. Use `layout="tabs"` for the classic switcher. When `mode` is `"date"` or `"time"`, the badges are never shown.

```tsx
{/* Default: both panels */}
<DateTime inline mode="datetime" onChange={setValue} />

{/* Classic tabs */}
<DateTime inline mode="datetime" layout="tabs" onChange={setValue} />

{/* Date only — no badges */}
<DateTime inline mode="date" onChange={setValue} />
```

## 12-hour clock

`use12Hours` only changes the time UI. Pair it with a 12-hour `format` so the input/value match what users see:

```tsx
<DateTimeInput
  use12Hours
  format="YYYY-MM-DD hh:mm:ss A"
  value={value}
  onChange={setValue}
/>
```

## Theming

Override CSS variables (light defaults shown):

```css
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
```

### Dark theme

Wrap the picker (or a parent) with `data-ctp-theme="dark"`:

```tsx
<div data-ctp-theme="dark">
  <DateTime inline mode="time" onChange={setValue} />
  <DateTimeInput mode="time" onChange={setValue} />
</div>
```

Inline pickers inherit theme from the wrapper. Portaled popovers/overlays copy `data-ctp-theme` from the input’s ancestors (or accept an explicit `theme="dark"` prop) so time and datetime popovers stay dark too.

Focusable controls use `:focus-visible` rings via `--ctp-focus`. Open animation respects `prefers-reduced-motion`.

## Locales

Locales are applied per instance (no global dayjs locale mutation). Import the dayjs locale module before use:

```tsx
import "dayjs/locale/fr";
import { DateTime } from "react-calendar-time";

<DateTime locale="fr" weekStartsOn={1} inline onChange={console.log} />
```

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, scripts, and PR guidelines.

## License

MIT

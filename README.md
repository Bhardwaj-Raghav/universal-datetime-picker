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
  // Prefer asString={false} for Date / TimeValue (recommended going forward)
  const [value, setValue] = useState<Date | null>(null);

  return (
    <>
      <DateTimeInput asString={false} value={value} onChange={setValue} />
      <DateTime inline asString={false} value={value} onChange={setValue} />
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

## Return values

`onChange` shape depends on `mode` and `asString`:

| Mode / flags | `asString` | `onChange` receives |
|--------------|------------|---------------------|
| `mode="date"` | `false` | `Date` (start of day) |
| `mode="datetime"` | `false` | `Date` |
| `mode="time"` | `false` | `TimeValue` object |
| any mode | `true` / omitted | formatted `string \| null` |
| range | `false` | `{ start: Date \| null; end: Date \| null }` |
| range | `true` / omitted | `{ start: string \| null; end: string \| null }` |

**Deprecation:** omitting `asString` still returns a formatted string today, but logs a one-time console warning. Set `asString={true}` to keep strings explicitly, or `asString={false}` to opt into `Date` / `TimeValue` now. A future major release will default to objects.

### `TimeValue` (`mode="time"`, `asString={false}`)

```ts
{
  hour: 2,         // 1–12
  hour24: 14,      // 0–23
  minute: 30,
  second: 0,
  ampm: "PM",
  formatted: "14:30:00" // or "02:30:00 PM" when use12Hours
}
```

```tsx
<DateTime
  inline
  mode="time"
  asString={false}
  onChange={(value) => {
    // value is TimeValue | null
    console.log(value?.hour24, value?.formatted);
  }}
/>
```

## Props

### Shared (`DateTime` / `DateTimeInput`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| string \| Dayjs \| null` | — | Controlled value |
| `defaultValue` | same | — | Uncontrolled initial value |
| `onChange` | `(value: Date \| TimeValue \| string \| null) => void` | — | Fired on OK / Clear |
| `asString` | `boolean` | omitted → string (deprecated) | `true` = string; `false` = `Date` / `TimeValue` |
| `showSeconds` | `boolean` | `true` | Show seconds column; included in default format |
| `format` | `string` | derived from mode | dayjs format (auto from mode / `use12Hours` / `showSeconds` when omitted) |
| `mode` | `"datetime" \| "date" \| "time"` | `"datetime"` | Picker mode |
| `layout` | `"combined" \| "tabs"` | `"combined"` | When `mode="datetime"`: show both panels, or Date/Time tabs. Hidden for date-only / time-only |
| `minDate` / `maxDate` | date-like | — | Inclusive bounds |
| `disablePastDates` | `boolean` | `false` | Disable days before today |
| `disableFutureDates` | `boolean` | `false` | Disable days after today |
| `weekStartsOn` | `0–6` | `0` | First day of week (0 = Sunday) |
| `use12Hours` | `boolean` | `false` | 12-hour clock with AM/PM (`false` = 24-hour) |
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

`DateTimeInput` always uses popover mode. The popover uses `position: fixed`, flips above the input when needed, repositions on scroll/resize, and closes on outside click or Escape. Time-only popovers use a compact width.

### Use any button or input as the trigger

Control `open` yourself to open the picker from any element. Add `popover` and pass the trigger element through `anchorEl` to position the picker beside it.

```tsx
import { useState } from "react";
import { DateTime } from "react-calendar-time";

function CustomDateTrigger() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Date | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <button
        ref={setAnchorEl}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
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
```

Leave out `popover` and `anchorEl` to open the same picker as a centered modal:

```tsx
<button type="button" onClick={() => setOpen(true)}>
  Choose a date
</button>
<DateTime
  mode="date"
  open={open}
  onOpenChange={setOpen}
  asString={false}
  onChange={setValue}
/>
```

### `DateTimeInput` extras

`placeholder`, `id`, `name`, `disabled`, `readOnly`, `aria-label`, `aria-labelledby`, `inputClassName`

### `DateTimeRange`

Supports `asString` like the single picker. With `asString={false}`, `onChange` receives `{ start: Date | null; end: Date | null }`; with `asString={true}` (or omitted), ends are formatted strings. Also supports keyboard grid navigation, hover range preview, and the same `locale` / `weekStartsOn` / `labels` props.

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
<DateTime inline mode="datetime" asString={false} onChange={setValue} />

{/* Classic tabs */}
<DateTime inline mode="datetime" layout="tabs" asString={false} onChange={setValue} />

{/* Date only — no badges */}
<DateTime inline mode="date" asString={false} onChange={setValue} />
```

## 12-hour clock & seconds

`use12Hours` switches the time UI to AM/PM (`false` keeps 24-hour). When `format` is omitted, it is derived from `mode`, `use12Hours`, and `showSeconds`:

```tsx
{/* 12-hour with seconds */}
<DateTimeInput asString use12Hours value={value} onChange={setValue} />

{/* 24-hour, no seconds */}
<DateTime inline mode="time" showSeconds={false} asString={false} onChange={setTime} />
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
  --ctp-selected-bg: #558b2f;
  --ctp-selected-fg: #ffffff;
  --ctp-hover-bg: color-mix(in srgb, var(--ctp-primary) 16%, white);
  --ctp-range-bg: color-mix(in srgb, var(--ctp-primary) 28%, white);
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

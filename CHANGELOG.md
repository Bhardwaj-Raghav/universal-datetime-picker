# Changelog

## 2.1.2

### Added
- JSDoc on the public API so editors show docs for components, props, controllers, and framework helpers.

### Changed
- Docs only. No runtime or API behavior changes.

## 2.1.1

Month/year navigation flicker fix for vanilla, CDN, and Web Component integrations.

### Fixed
- **Month/year flicker**: vanilla `paint()` reuses the open picker root instead of tearing down and remounting on every navigation emit (CDN, WC, Vue, Svelte, Angular). Enter animation runs only on first open (`.ctp-entering`).
- **Web Component remount thrashing**: attribute/`value` updates call `handle.update()` when a handle already exists instead of destroy + recreate.

## 2.1.0

UX and API improvements for single and range pickers.

### Changed
- **`asString` default is now objects**: omitting `asString` returns `Date` / `TimeValue` / `{ start, end: Date | null }`. Set `asString={true}` for formatted strings. The one-time deprecation warning is removed.
- **Commit on selection**: date-only overlays commit and close when a day is picked (no OK). Datetime and time overlays keep an OK button and commit on confirm. Clear and Close remain.
- **Initial month respects bounds**: when today is outside `minDate` / `maxDate` (or past/future disables), the picker opens on the first or last selectable day.
- **Month/year drill-down resets on close**: reopening always returns to the day grid at the committed value's month.
- Website landing page and SEO metadata updated for react date picker / date time picker discoverability.
- npm `description` and `keywords` tuned for searches like “react date picker”, “datetime picker”, and “react date time picker”.

### Added
- **`DateTimeInput` calendar icon** at the end of the field (override with `icon`, hide with `icon={null}`).
- **`DateTimeInput` `customInput`**: pass your own trigger element; ref/value/onClick are injected.
- **`DateTimeInput` `noStyle`**: skip default input classes so you style via `className` / `inputClassName` / `style`.

### Fixed
- No day is pre-selected when the initial value is null, empty, or invalid on first open.
- Default calendar icon uses higher-contrast foreground color for better visibility.
- Month/year navigation (arrows and month/year grids) cannot move outside `minDate` / `maxDate` / past/future disable bounds.
- Calendar month grid always renders **6 weeks** so height stays stable when changing months.

### Removed
- OK button from **date-only** and **range** overlay footers (selection commits immediately). Datetime and time overlays still show OK.

## 2.0.0

Framework-agnostic release: headless core, vanilla renderer, Web Components, CDN IIFE, and multi-framework entry points.

### Breaking
- Package renamed from `react-calendar-time` to **`universal-datetime-picker`**. Update install commands and import specifiers.
- React peer dependencies are now `>= 18` (React 17 no longer supported).
- Custom elements renamed to `<datetime-picker>`, `<datetime-picker-input>`, and `<datetime-picker-range>` (never published under the old tag names in a stable release).

### Added
- Subpath exports: `./core`, `./vanilla`, `./wc`, `./vue`, `./svelte`, `./angular`.
- CDN / unpkg / jsDelivr IIFE bundle with auto-registration.
- `defineCustomElements({ prefix })` for collision-safe tag names.
- Angular helper `registerDateTimePickerElements()` (`registerCalendarTimeElements` remains as deprecated alias).

### Changed
- React components use shared `PickerController` / `RangeController` via `useSyncExternalStore`.
- React peers are **optional** when using vanilla, Web Components, or CDN only.
- Inline pickers no longer show the overlay Close button.

### Migrating
See README section **Migrating from react-calendar-time**.

## 1.1.0

Hardening and UI modernization for the post-v1 feature set.

### Layout
- Default `layout="combined"` shows date and time together (no Date/Time tabs)
- `layout="tabs"` restores the classic Date | Time switcher
- Date-only / time-only modes never show the mode badges

### Popover
- Position with `position: fixed` viewport coordinates
- Live reposition on scroll / resize; measure real picker size
- Close on outside click (in addition to Escape)
- Stable live `anchorEl` from `DateTimeInput`

### Accessibility & correctness
- Calendar Home/End honor `weekStartsOn`
- `DateTimeRange` keyboard grid navigation, hover range preview, and live region hints
- Controlled `value={null}` clears draft state for single and range pickers
- Optional `labels` prop for chrome strings

### Locales
- Apply locale per instance without mutating global dayjs locale
- Localized month titles and day `aria-label`s

### UI
- Modern floating panel chrome (softer elevation, thinner borders)
- Expanded CSS tokens (`--ctp-fg`, `--ctp-focus`, `--ctp-z-index`, …)
- Dark theme via `[data-ctp-theme="dark"]` (portaled pickers inherit from input ancestors or `theme` prop)
- `:focus-visible` rings and reduced-motion-aware open animation
- Neutral input border with primary focus ring
- Default combined date+time layout; optional `layout="tabs"` separate view

### Docs / demos
- README coverage for labels, layout, 12h format pairing, popover, dark theme
- Expanded Storybook stories and website examples

## 1.0.0

Breaking rewrite of the library for production use.

### Packaging
- Ship compiled ESM + CJS + TypeScript declarations via `tsup`
- Publish only `dist/` with a proper `exports` map
- Move `react` / `react-dom` to peer dependencies
- Replace Moment with `dayjs`
- Ship plain CSS (`react-calendar-time/style.css`): consumers no longer need Sass
- Package renamed from `react-datetime-picker-component` to `react-calendar-time`

### API
- Replace `onClick` with `onChange`
- Add controlled / uncontrolled `value` and `open`
- Replace `onlyDate` / `onlyTime` with `mode: "datetime" | "date" | "time"`
- Replace `notFixedPosition` with `inline`
- Rename `disableFuturedate` / `disablePastdate` → `disableFutureDates` / `disablePastDates`
- Add `minDate`, `maxDate`, `format`, `className`, `weekStartsOn`, `use12Hours`, `locale`
- Add `DateTime.Input` / `DateTimeInput` with popover positioning
- Add `DateTime.Range` / `DateTimeRange` for range selection

### Correctness
- Fix last day of month not selectable
- Fix selection highlight matching day-of-month only
- Fix past/future disable ignoring year
- Remove self-updating `useEffect` on the selected value
- Parse/format dates with dayjs (no unreliable `new Date(string)`)
- Remove duplicate DOM ids, debug `console.log`s, and unstable keys

### Accessibility
- Dialog semantics, Escape / backdrop dismiss, focus trap
- Calendar grid with arrow-key navigation
- Accessible names on controls and day cells

### Tooling
- Vitest + Testing Library
- ESLint + Prettier
- GitHub Actions CI
- Storybook + Vite playground

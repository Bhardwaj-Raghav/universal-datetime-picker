import type { Dayjs } from "dayjs";

/** Selection mode: date+time, date only, or time only. */
export type DateTimeMode = "datetime" | "date" | "time";

/**
 * How date and time panels are arranged when `mode="datetime"`.
 * - `combined` (default): both panels visible at once (no Date/Time tabs)
 * - `tabs`: separate Date / Time tabs (legacy layout)
 */
export type DateTimeLayout = "combined" | "tabs";

/** Accepted controlled/uncontrolled value shapes for a single picker. */
export type DateTimeValue = Date | string | Dayjs | null;

/**
 * Time-only selection when `asString` is not `true` and `mode="time"`.
 * `hour` is 1–12; `hour24` is 0–23.
 */
export interface TimeValue {
  /** Clock hour in 1–12. */
  hour: number;
  /** Hour in 0–23. */
  hour24: number;
  /** Minutes (0–59). */
  minute: number;
  /** Seconds (0–59). */
  second: number;
  /** AM/PM for 12-hour display (derived from `hour24`). */
  ampm: "AM" | "PM";
  /** Value formatted with the resolved format string. */
  formatted: string;
}

/**
 * Value passed to `onChange` for DateTime / DateTimeInput.
 * Shape depends on `asString` and `mode` (string, `Date`, or `TimeValue`).
 */
export type DateTimeChangeValue = Date | TimeValue | string | null;

/** Optional chrome strings for UI labels (not a full i18n suite). */
export interface DateTimeLabels {
  /** Date tab / section label. */
  date?: string;
  /** Time tab / section label. */
  time?: string;
  /** Clear button label. */
  clear?: string;
  /** Close / dismiss control label. */
  close?: string;
  /** Confirm button (datetime/time overlays). */
  ok?: string;
  /** Range start column label. */
  start?: string;
  /** Range end column label. */
  end?: string;
  /** Accessible title when choosing a single date. */
  chooseDate?: string;
  /** Accessible title when choosing a date range. */
  chooseDateRange?: string;
  /** Accessible title for the month panel. */
  chooseMonth?: string;
  /** Accessible title for the year panel. */
  chooseYear?: string;
  /** Previous-month navigation control. */
  previousMonth?: string;
  /** Next-month navigation control. */
  nextMonth?: string;
  /** Previous-year / previous year-window navigation. */
  previousYear?: string;
  /** Next-year / next year-window navigation. */
  nextYear?: string;
  /** Hint while waiting for the range end day. */
  selectEnd?: string;
}

/** Built-in English label strings used when `labels` omits a key. */
export const DEFAULT_LABELS: Required<DateTimeLabels> = {
  date: "Date",
  time: "Time",
  clear: "Clear",
  close: "Close",
  ok: "OK",
  start: "Start",
  end: "End",
  chooseDate: "Choose date",
  chooseDateRange: "Choose date range",
  chooseMonth: "Choose month",
  chooseYear: "Choose year",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  previousYear: "Previous year",
  nextYear: "Next year",
  selectEnd: "Select end date",
};

/** Calendar drill-down panel for month / year selection. */
export type CalendarPanel = "day" | "month" | "year";

/** Shared picker options (framework-agnostic). */
export interface DateTimeBaseOptions {
  /** Controlled value. */
  value?: DateTimeValue;
  /** Uncontrolled initial value. */
  defaultValue?: DateTimeValue;
  /** Called when the user commits a selection (or clears). */
  onChange?: (value: DateTimeChangeValue) => void;
  /**
   * When `true`, `onChange` receives a formatted string.
   * When omitted or `false`, date/datetime modes return a `Date` and
   * `mode="time"` returns a {@link TimeValue}.
   *
   * @example
   * ```ts
   * // Date object
   * createDateTimePicker(el, { asString: false, onChange: (v) => console.log(v) });
   * // Formatted string
   * createDateTimePicker(el, { asString: true, onChange: (v) => console.log(v) });
   * ```
   */
  asString?: boolean;
  /**
   * Show seconds in the time UI and default formats.
   * @default true
   */
  showSeconds?: boolean;
  /** dayjs format override; when omitted, format is derived from `mode` / `use12Hours` / `showSeconds`. */
  format?: string;
  /**
   * What the picker edits.
   * @default "datetime"
   */
  mode?: DateTimeMode;
  /**
   * Datetime panel arrangement (`combined` or `tabs`).
   * @default "combined"
   */
  layout?: DateTimeLayout;
  /** Inclusive minimum selectable calendar day. */
  minDate?: DateTimeValue;
  /** Inclusive maximum selectable calendar day. */
  maxDate?: DateTimeValue;
  /** Disable days before today. */
  disablePastDates?: boolean;
  /** Disable days after today. */
  disableFutureDates?: boolean;
  /**
   * First day of the week: `0` Sunday … `6` Saturday.
   * @default 0
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Use a 12-hour clock with AM/PM.
   * @default false
   */
  use12Hours?: boolean;
  /**
   * Render embedded in the page (always “open”); skips overlay/popover chrome.
   * @default false
   */
  inline?: boolean;
  /** Extra class name on the picker root. */
  className?: string;
  /** Inline style object or CSS string (vanilla / WC). */
  style?: Partial<CSSStyleDeclaration> | string | Record<string, string | number>;
  /**
   * dayjs locale code for month/weekday labels and localized formatting.
   * @default "en"
   */
  locale?: string;
  /** Override UI chrome strings; merged over {@link DEFAULT_LABELS}. */
  labels?: DateTimeLabels;
  /** Visual theme attribute (`light` or `dark`). */
  theme?: "light" | "dark";
  /**
   * Controlled open state for non-inline overlays/popovers.
   * When set, takes precedence over `defaultOpen`.
   *
   * @example
   * ```tsx
   * const [open, setOpen] = useState(false);
   * <DateTime open={open} onOpenChange={setOpen} defaultOpen={false} />
   * ```
   */
  open?: boolean;
  /**
   * Uncontrolled initial open state when `open` is omitted.
   * Ignored when `inline` (always open). Non-inline React/vanilla default is `true`
   * unless a wrapper (e.g. `DateTimeInput`) overrides it. Web Components treat a
   * missing `open` attribute as closed.
   *
   * @default true
   */
  defaultOpen?: boolean;
  /** Called when overlay/popover open state changes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Anchor element for `popover` positioning (typically the trigger).
   *
   * @example
   * ```tsx
   * const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
   * <button ref={setAnchorEl} onClick={() => setOpen(true)}>Pick</button>
   * <DateTime popover anchorEl={anchorEl} open={open} onOpenChange={setOpen} />
   * ```
   */
  anchorEl?: HTMLElement | null;
  /**
   * Position beside `anchorEl` instead of a centered overlay.
   * Requires `anchorEl` for correct placement. Not supported on range pickers.
   *
   * @default false
   */
  popover?: boolean;
}

/** Committed start/end pair from a range picker `onChange`. */
export interface DateRangeValue {
  /** Range start (`Date`, formatted string when `asString`, or `null`). */
  start: Date | string | null;
  /** Range end (`Date`, formatted string when `asString`, or `null`). */
  end: Date | string | null;
}

/** Options for the date-range picker (no time / popover / anchor). */
export interface DateTimeRangeOptions {
  /** Controlled `{ start, end }` value. */
  value?: { start: DateTimeValue; end: DateTimeValue } | null;
  /** Uncontrolled initial `{ start, end }`. */
  defaultValue?: { start: DateTimeValue; end: DateTimeValue } | null;
  /** Called when the range is confirmed or cleared. */
  onChange?: (value: DateRangeValue) => void;
  /**
   * When `true`, `onChange` start/end are formatted strings; otherwise `Date` (or `null`).
   */
  asString?: boolean;
  /** dayjs format override for range values. */
  format?: string;
  /** Inclusive minimum selectable calendar day. */
  minDate?: DateTimeValue;
  /** Inclusive maximum selectable calendar day. */
  maxDate?: DateTimeValue;
  /** Disable days before today. */
  disablePastDates?: boolean;
  /** Disable days after today. */
  disableFutureDates?: boolean;
  /**
   * First day of the week: `0` Sunday … `6` Saturday.
   * @default 0
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * dayjs locale code.
   * @default "en"
   */
  locale?: string;
  /** Override UI chrome strings; merged over {@link DEFAULT_LABELS}. */
  labels?: DateTimeLabels;
  /** Controlled open state for the non-inline modal overlay. */
  open?: boolean;
  /**
   * Uncontrolled initial open state when `open` is omitted.
   * @default true
   */
  defaultOpen?: boolean;
  /** Called when overlay open state changes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Render embedded (always open); skips modal overlay.
   * @default false
   */
  inline?: boolean;
  /** Extra class name on the picker root. */
  className?: string;
  /** Inline style object or CSS string (vanilla / WC). */
  style?: Partial<CSSStyleDeclaration> | string | Record<string, string | number>;
}

/** One cell in a month grid built by `buildCalendarMonth`. */
export interface CalendarDay {
  /** Calendar day for this cell. */
  date: Dayjs;
  /** Day belongs to the viewed month (not a leading/trailing pad day). */
  isCurrentMonth: boolean;
  /** Day is today. */
  isCurrentDate: boolean;
  /** Day is after today. */
  isFuture: boolean;
  /** Day is before today. */
  isPast: boolean;
  /** Saturday or Sunday. */
  isWeekend: boolean;
  /** Outside min/max or past/future disable rules. */
  isDisabled: boolean;
  /** Matches the single-picker selected day. */
  isSelected: boolean;
  /** Inside an inclusive range selection (range mode). */
  isInRange?: boolean;
  /** First day of the selected range. */
  isRangeStart?: boolean;
  /** Last day of the selected range. */
  isRangeEnd?: boolean;
}

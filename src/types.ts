import type { Dayjs } from "dayjs";
import type { CSSProperties } from "react";

export type DateTimeMode = "datetime" | "date" | "time";

/**
 * How date and time panels are arranged when `mode="datetime"`.
 * - `combined` (default): both panels visible at once (no Date/Time tabs)
 * - `tabs`: separate Date / Time tabs (legacy layout)
 */
export type DateTimeLayout = "combined" | "tabs";

export type DateTimeValue = Date | string | Dayjs | null;

/**
 * Time-only selection when `asString={false}` and `mode="time"`.
 * `hour` is 1–12; `hour24` is 0–23.
 */
export interface TimeValue {
  hour: number;
  hour24: number;
  minute: number;
  second: number;
  ampm: "AM" | "PM";
  formatted: string;
}

/** Value passed to `onChange` for DateTime / DateTimeInput. */
export type DateTimeChangeValue = Date | TimeValue | string | null;

/** Optional chrome strings for UI labels (not a full i18n suite). */
export interface DateTimeLabels {
  date?: string;
  time?: string;
  clear?: string;
  close?: string;
  ok?: string;
  start?: string;
  end?: string;
  chooseDate?: string;
  chooseDateRange?: string;
  chooseMonth?: string;
  chooseYear?: string;
  previousMonth?: string;
  nextMonth?: string;
  previousYear?: string;
  nextYear?: string;
  selectEnd?: string;
}

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

export interface DateTimeBaseProps {
  /** Controlled value. Accepts Date, dayjs, formatted string, or null. */
  value?: DateTimeValue;
  /** Uncontrolled initial value. */
  defaultValue?: DateTimeValue;
  /** Called when the user confirms a selection (OK) or clears. */
  onChange?: (value: DateTimeChangeValue) => void;
  /**
   * When `true`, `onChange` receives a formatted string.
   * When `false`, receives a native `Date` (date/datetime) or `TimeValue` (time).
   * When omitted, still returns a string today (deprecated — set explicitly).
   */
  asString?: boolean;
  /**
   * Show seconds in the time UI and include them in the default format.
   * Default: `true`.
   */
  showSeconds?: boolean;
  /** dayjs format string. When omitted, derived from mode / use12Hours / showSeconds. */
  format?: string;
  /** Picker mode. Default: `datetime` */
  mode?: DateTimeMode;
  /**
   * Date/time panel arrangement when `mode="datetime"`.
   * Default: `combined`. Use `tabs` for the classic Date | Time switcher.
   * Ignored when `mode` is `date` or `time` (tabs are never shown).
   */
  layout?: DateTimeLayout;
  minDate?: DateTimeValue;
  maxDate?: DateTimeValue;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  /** First day of week: 0 = Sunday … 6 = Saturday. Default: 0 */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Use 12-hour clock with AM/PM. Default: false */
  use12Hours?: boolean;
  /** Render inline without overlay. Default: false */
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Locale code passed to dayjs (e.g. `en`, `fr`). Default: `en` */
  locale?: string;
  /** Override chrome strings (Date/Time/OK/Clear/…). */
  labels?: DateTimeLabels;
  /**
   * Color theme. Prefer wrapping with `data-ctp-theme="dark"` for inline pickers.
   * For portaled popovers/overlays, pass `theme` or place `data-ctp-theme` on an
   * ancestor of the input — the picker copies it onto the portal root.
   */
  theme?: "light" | "dark";
}

export interface DateTimeProps extends DateTimeBaseProps {
  /** Controlled open state (overlay / popover). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Anchor element for popover positioning (used by DateTimeInput). */
  anchorEl?: HTMLElement | null;
  /** Prefer popover near the trigger instead of a fullscreen overlay. */
  popover?: boolean;
}

export interface DateTimeInputProps extends DateTimeBaseProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  "aria-labelledby"?: string;
  "aria-label"?: string;
  inputClassName?: string;
}

export interface DateRangeValue {
  start: Date | string | null;
  end: Date | string | null;
}

export interface DateTimeRangeProps {
  value?: { start: DateTimeValue; end: DateTimeValue } | null;
  defaultValue?: { start: DateTimeValue; end: DateTimeValue } | null;
  onChange?: (value: DateRangeValue) => void;
  /**
   * When `true`, range ends are formatted strings.
   * When `false`, ends are native `Date` objects.
   * When omitted, still returns strings today (deprecated — set explicitly).
   */
  asString?: boolean;
  format?: string;
  minDate?: DateTimeValue;
  maxDate?: DateTimeValue;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: string;
  labels?: DateTimeLabels;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface CalendarDay {
  date: Dayjs;
  isCurrentMonth: boolean;
  isCurrentDate: boolean;
  isFuture: boolean;
  isPast: boolean;
  isWeekend: boolean;
  isDisabled: boolean;
  isSelected: boolean;
  isInRange?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
}

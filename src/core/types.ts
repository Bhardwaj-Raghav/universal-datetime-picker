import type { Dayjs } from "dayjs";

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

/** Shared picker options (framework-agnostic). */
export interface DateTimeBaseOptions {
  value?: DateTimeValue;
  defaultValue?: DateTimeValue;
  onChange?: (value: DateTimeChangeValue) => void;
  asString?: boolean;
  showSeconds?: boolean;
  format?: string;
  mode?: DateTimeMode;
  layout?: DateTimeLayout;
  minDate?: DateTimeValue;
  maxDate?: DateTimeValue;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  use12Hours?: boolean;
  inline?: boolean;
  className?: string;
  /** Inline style object or CSS string (vanilla / WC). */
  style?: Partial<CSSStyleDeclaration> | string | Record<string, string | number>;
  locale?: string;
  labels?: DateTimeLabels;
  theme?: "light" | "dark";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  anchorEl?: HTMLElement | null;
  popover?: boolean;
}

export interface DateRangeValue {
  start: Date | string | null;
  end: Date | string | null;
}

export interface DateTimeRangeOptions {
  value?: { start: DateTimeValue; end: DateTimeValue } | null;
  defaultValue?: { start: DateTimeValue; end: DateTimeValue } | null;
  onChange?: (value: DateRangeValue) => void;
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
  style?: Partial<CSSStyleDeclaration> | string | Record<string, string | number>;
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

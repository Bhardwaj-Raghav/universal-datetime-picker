import type { CalendarDay, DateTimeValue } from "../types";
import {
  dayjs,
  parseValue,
  startOfWeek,
  type Dayjs,
} from "./date";

export interface BuildCalendarOptions {
  viewMonth: Dayjs;
  selected?: Dayjs | null;
  rangeStart?: Dayjs | null;
  rangeEnd?: Dayjs | null;
  /** Tentative end for hover preview while selecting a range. */
  hoverEnd?: Dayjs | null;
  minDate?: DateTimeValue;
  maxDate?: DateTimeValue;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  weekStartsOn?: number;
}

export type DayDisableOptions = Omit<
  BuildCalendarOptions,
  "viewMonth" | "selected" | "rangeStart" | "rangeEnd" | "hoverEnd"
>;

export function isDayDisabled(
  date: Dayjs,
  options: DayDisableOptions
): boolean {
  return isDisabledDay(date, options);
}

function isDisabledDay(
  date: Dayjs,
  options: DayDisableOptions
): boolean {
  const today = dayjs().startOf("day");
  const day = date.startOf("day");

  if (options.disablePastDates && day.isBefore(today, "day")) {
    return true;
  }
  if (options.disableFutureDates && day.isAfter(today, "day")) {
    return true;
  }

  const min = parseValue(options.minDate ?? null);
  const max = parseValue(options.maxDate ?? null);

  if (min && day.isBefore(min.startOf("day"), "day")) {
    return true;
  }
  if (max && day.isAfter(max.startOf("day"), "day")) {
    return true;
  }

  return false;
}

function findFirstSelectable(
  from: Dayjs,
  options: DayDisableOptions,
  maxDays = 366 * 20
): Dayjs {
  let cursor = from.startOf("day");
  for (let i = 0; i < maxDays; i += 1) {
    if (!isDisabledDay(cursor, options)) {
      return cursor;
    }
    cursor = cursor.add(1, "day");
  }
  return from.startOf("day");
}

function findLastSelectable(
  from: Dayjs,
  options: DayDisableOptions,
  maxDays = 366 * 20
): Dayjs {
  let cursor = from.startOf("day");
  for (let i = 0; i < maxDays; i += 1) {
    if (!isDisabledDay(cursor, options)) {
      return cursor;
    }
    cursor = cursor.subtract(1, "day");
  }
  return from.startOf("day");
}

/** Clamps a candidate day to the nearest selectable day within bounds. */
export function clampToSelectableDate(
  candidate: Dayjs,
  options: DayDisableOptions
): Dayjs {
  const day = candidate.startOf("day");
  if (!isDisabledDay(day, options)) {
    return day;
  }

  const today = dayjs().startOf("day");
  const min = parseValue(options.minDate ?? null)?.startOf("day");
  const max = parseValue(options.maxDate ?? null)?.startOf("day");

  if (max && day.isAfter(max, "day")) {
    return findLastSelectable(max, options);
  }
  if (min && day.isBefore(min, "day")) {
    return findFirstSelectable(min, options);
  }
  if (options.disableFutureDates && day.isAfter(today, "day")) {
    return findLastSelectable(today, options);
  }
  if (options.disablePastDates && day.isBefore(today, "day")) {
    return findFirstSelectable(today, options);
  }

  const start = min ?? today;
  return findFirstSelectable(start, options);
}

/** Effective inclusive min/max days from disable options (null = unbounded). */
export function resolveSelectableRange(options: DayDisableOptions): {
  min: Dayjs | null;
  max: Dayjs | null;
} {
  const today = dayjs().startOf("day");
  let min = parseValue(options.minDate ?? null)?.startOf("day") ?? null;
  let max = parseValue(options.maxDate ?? null)?.startOf("day") ?? null;

  if (options.disablePastDates) {
    min = min && min.isAfter(today, "day") ? min : today;
  }
  if (options.disableFutureDates) {
    max = max && max.isBefore(today, "day") ? max : today;
  }

  return { min, max };
}

/** True when the month overlaps the selectable day range. */
export function isMonthSelectable(
  month: Dayjs,
  options: DayDisableOptions
): boolean {
  const { min, max } = resolveSelectableRange(options);
  const start = month.startOf("month");
  const end = month.endOf("month").startOf("day");
  if (min && end.isBefore(min, "day")) {
    return false;
  }
  if (max && start.isAfter(max, "day")) {
    return false;
  }
  return true;
}

/** True when the calendar year overlaps the selectable day range. */
export function isYearSelectable(
  year: number,
  options: DayDisableOptions
): boolean {
  const { min, max } = resolveSelectableRange(options);
  const start = dayjs().year(year).startOf("year");
  const end = dayjs().year(year).endOf("year").startOf("day");
  if (min && end.isBefore(min, "day")) {
    return false;
  }
  if (max && start.isAfter(max, "day")) {
    return false;
  }
  return true;
}

export function yearWindowStart(year: number): number {
  return Math.floor(year / 12) * 12;
}

/** True when any year in the 12-year window is selectable. */
export function isYearWindowSelectable(
  windowStart: number,
  options: DayDisableOptions
): boolean {
  for (let y = windowStart; y < windowStart + 12; y += 1) {
    if (isYearSelectable(y, options)) {
      return true;
    }
  }
  return false;
}

/** Clamp a view month so it stays within the selectable range. */
export function clampViewMonth(
  candidate: Dayjs,
  options: DayDisableOptions
): Dayjs {
  const { min, max } = resolveSelectableRange(options);
  let month = candidate.startOf("month");
  if (min && month.endOf("month").startOf("day").isBefore(min, "day")) {
    month = min.startOf("month");
  }
  if (max && month.startOf("month").isAfter(max, "day")) {
    month = max.startOf("month");
  }
  return month;
}

export type CalendarNavPanel = "day" | "month" | "year";

export function canNavigatePrev(
  viewMonth: Dayjs,
  panel: CalendarNavPanel,
  options: DayDisableOptions
): boolean {
  if (panel === "day") {
    return isMonthSelectable(viewMonth.subtract(1, "month"), options);
  }
  if (panel === "month") {
    return isYearSelectable(viewMonth.year() - 1, options);
  }
  const prevWindow = yearWindowStart(viewMonth.year()) - 12;
  return isYearWindowSelectable(prevWindow, options);
}

export function canNavigateNext(
  viewMonth: Dayjs,
  panel: CalendarNavPanel,
  options: DayDisableOptions
): boolean {
  if (panel === "day") {
    return isMonthSelectable(viewMonth.add(1, "month"), options);
  }
  if (panel === "month") {
    return isYearSelectable(viewMonth.year() + 1, options);
  }
  const nextWindow = yearWindowStart(viewMonth.year()) + 12;
  return isYearWindowSelectable(nextWindow, options);
}

/**
 * Builds a fixed 6×7 month grid (always 6 weeks) so calendar height
 * stays consistent when navigating between months.
 */
export function buildCalendarMonth(
  options: BuildCalendarOptions
): CalendarDay[][] {
  const weekStartsOn = options.weekStartsOn ?? 0;
  const monthStart = options.viewMonth.startOf("month");
  const gridStart = startOfWeek(monthStart, weekStartsOn);

  const weeks: CalendarDay[][] = [];
  let cursor = gridStart.clone();

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i += 1) {
      const date = cursor.clone();
      const isCurrentMonth = date.isSame(options.viewMonth, "month");
      const isSelected = Boolean(
        options.selected && date.isSame(options.selected, "day")
      );
      const isRangeStart = Boolean(
        options.rangeStart && date.isSame(options.rangeStart, "day")
      );
      const isRangeEnd = Boolean(
        options.rangeEnd && date.isSame(options.rangeEnd, "day")
      );
      const effectiveEnd = options.rangeEnd ?? options.hoverEnd ?? null;
      let isInRange = false;
      if (options.rangeStart && effectiveEnd) {
        const rangeLow = options.rangeStart.isBefore(effectiveEnd, "day")
          ? options.rangeStart
          : effectiveEnd;
        const rangeHigh = options.rangeStart.isBefore(effectiveEnd, "day")
          ? effectiveEnd
          : options.rangeStart;
        isInRange =
          (date.isAfter(rangeLow, "day") && date.isBefore(rangeHigh, "day")) ||
          date.isSame(rangeLow, "day") ||
          date.isSame(rangeHigh, "day");
      }

      week.push({
        date,
        isCurrentMonth,
        isCurrentDate: date.isSame(dayjs(), "day"),
        isFuture: date.isAfter(dayjs(), "day"),
        isPast: date.isBefore(dayjs(), "day"),
        isWeekend: date.day() === 0 || date.day() === 6,
        isDisabled: isDisabledDay(date, options),
        isSelected,
        isInRange,
        isRangeStart,
        isRangeEnd,
      });

      cursor = cursor.add(1, "day");
    }
    weeks.push(week);
  }

  return weeks;
}

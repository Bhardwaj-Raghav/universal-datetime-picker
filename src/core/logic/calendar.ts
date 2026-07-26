import type { CalendarDay, DateTimeValue } from "../types";
import {
  dayjs,
  endOfWeek,
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

function isDisabledDay(
  date: Dayjs,
  options: BuildCalendarOptions
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

/**
 * Builds a month grid of weeks × days with correct current-month flags
 * (including the last day of the month).
 */
export function buildCalendarMonth(
  options: BuildCalendarOptions
): CalendarDay[][] {
  const weekStartsOn = options.weekStartsOn ?? 0;
  const monthStart = options.viewMonth.startOf("month");
  const monthEnd = options.viewMonth.endOf("month");
  const gridStart = startOfWeek(monthStart, weekStartsOn);
  const gridEnd = endOfWeek(monthEnd, weekStartsOn);

  const weeks: CalendarDay[][] = [];
  let cursor = gridStart.clone();

  while (cursor.isBefore(gridEnd) || cursor.isSame(gridEnd, "day")) {
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

import dayjs, { type Dayjs, type ConfigType } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import type { DateTimeMode, TimeValue } from "../types";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localeData);
dayjs.extend(weekday);

/** Shared dayjs instance with plugins used by the picker (parse/format/locale helpers). */
export { dayjs };
/** dayjs `Dayjs` instance type. */
export type { Dayjs };

/** Default datetime format when `mode` is datetime and no custom `format` is set. */
export const DEFAULT_FORMAT = "YYYY-MM-DD HH:mm:ss";
/** Default date-only format. */
export const DATE_FORMAT = "YYYY-MM-DD";
/** Default 24-hour time format with seconds. */
export const TIME_FORMAT = "HH:mm:ss";

/**
 * Resolves the dayjs format string from `format` or from `mode` / `use12Hours` / `showSeconds`.
 */
export function resolveFormat(options: {
  /** Selection mode used when `format` is omitted. */
  mode?: DateTimeMode;
  /** Explicit dayjs format; wins over derived defaults. */
  format?: string;
  /** Prefer 12-hour time tokens when deriving a format. */
  use12Hours?: boolean;
  /** Include seconds in the derived time format. @default true */
  showSeconds?: boolean;
}): string {
  if (options.format) {
    return options.format;
  }

  const mode = options.mode ?? "datetime";
  const showSeconds = options.showSeconds !== false;
  const use12Hours = Boolean(options.use12Hours);

  const timePart = use12Hours
    ? showSeconds
      ? "hh:mm:ss A"
      : "hh:mm A"
    : showSeconds
      ? "HH:mm:ss"
      : "HH:mm";

  if (mode === "date") {
    return DATE_FORMAT;
  }
  if (mode === "time") {
    return timePart;
  }
  return `${DATE_FORMAT} ${timePart}`;
}

/** Builds a {@link TimeValue} from a dayjs instance for `mode="time"` commits. */
export function buildTimeValue(value: Dayjs, format: string): TimeValue {
  const hour24 = value.hour();
  const { hour, isAm } = to12Hour(hour24);
  return {
    hour,
    hour24,
    minute: value.minute(),
    second: value.second(),
    ampm: isAm ? "AM" : "PM",
    formatted: value.format(format),
  };
}

/**
 * Parses a picker value (`Date`, string, dayjs, etc.) into a dayjs instance, or `null` if invalid.
 */
export function parseValue(
  value: ConfigType | undefined | null,
  format: string = DEFAULT_FORMAT
): Dayjs | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (dayjs.isDayjs(value)) {
    return value.isValid() ? value : null;
  }

  if (value instanceof Date) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  }

  if (typeof value === "string") {
    const parsed = dayjs(value, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
    const fallback = dayjs(value);
    return fallback.isValid() ? fallback : null;
  }

  const parsed = dayjs(value as ConfigType);
  return parsed.isValid() ? parsed : null;
}

/** Formats a dayjs value, or returns `null` when missing/invalid. */
export function formatValue(
  value: Dayjs | null,
  format: string = DEFAULT_FORMAT
): string | null {
  if (!value || !value.isValid()) {
    return null;
  }
  return value.format(format);
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export const HOURS_24 = Array.from({ length: 24 }, (_, i) => pad2(i));
export const HOURS_12 = Array.from({ length: 12 }, (_, i) =>
  pad2(i === 0 ? 12 : i)
);
export const MINUTES = Array.from({ length: 60 }, (_, i) => pad2(i));

export function to12Hour(hour24: number): { hour: number; isAm: boolean } {
  const isAm = hour24 < 12;
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour, isAm };
}

export function to24Hour(hour12: number, isAm: boolean): number {
  if (hour12 === 12) {
    return isAm ? 0 : 12;
  }
  return isAm ? hour12 : hour12 + 12;
}

/** Formats a date with an instance locale (does not mutate global dayjs locale). */
export function formatLocalized(
  date: Dayjs,
  template: string,
  locale: string
): string {
  return date.locale(locale).format(template);
}

/**
 * Weekday labels for the given locale without mutating the global dayjs locale.
 * Consumers should import the locale module first, e.g. `import "dayjs/locale/fr"`.
 */
export function getWeekdayLabels(
  locale: string,
  weekStartsOn: number
): string[] {
  const labels = dayjs().locale(locale).localeData().weekdaysMin();
  return [...labels.slice(weekStartsOn), ...labels.slice(0, weekStartsOn)];
}

export function startOfWeek(date: Dayjs, weekStartsOn: number): Dayjs {
  const day = date.day();
  const diff = (day - weekStartsOn + 7) % 7;
  return date.subtract(diff, "day").startOf("day");
}

export function endOfWeek(date: Dayjs, weekStartsOn: number): Dayjs {
  return startOfWeek(date, weekStartsOn).add(6, "day").endOf("day");
}

import { buildCalendarMonth } from "./logic/calendar";
import type {
  DateRangeValue,
  DateTimeLabels,
  DateTimeRangeOptions,
  DateTimeValue,
} from "./types";
import { DEFAULT_LABELS } from "./types";
import {
  DATE_FORMAT,
  dayjs,
  endOfWeek,
  formatValue,
  getWeekdayLabels,
  parseValue,
  startOfWeek,
  warnAsStringDeprecation,
  type Dayjs,
} from "./logic/date";
import type { CalendarDay, CalendarPanel } from "./types";
import type { Listener } from "./controller";

export interface RangeSnapshot {
  start: Dayjs | null;
  end: Dayjs | null;
  hoverEnd: Dayjs | null;
  viewMonth: Dayjs;
  focusedDay: Dayjs;
  calPanel: CalendarPanel;
  open: boolean;
  inline: boolean;
  format: string;
  asString: boolean | undefined;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale: string;
  labels: Required<DateTimeLabels>;
  className?: string;
  weeks: CalendarDay[][];
  weekdayLabels: string[];
}

export class RangeController {
  private listeners = new Set<Listener>();
  private options: DateTimeRangeOptions;
  private start: Dayjs | null;
  private end: Dayjs | null;
  private hoverEnd: Dayjs | null = null;
  private viewMonth: Dayjs;
  private focusedDay: Dayjs;
  private calPanel: CalendarPanel = "day";
  private open: boolean;
  private snapshot: RangeSnapshot;

  constructor(options: DateTimeRangeOptions = {}) {
    this.options = { ...options };
    const format = options.format ?? DATE_FORMAT;
    const parsed = this.parseRange(options.value ?? options.defaultValue, format);
    this.start = parsed.start;
    this.end = parsed.end;
    this.viewMonth = (parsed.start ?? dayjs()).startOf("month");
    this.focusedDay = parsed.start ?? dayjs();
    this.open =
      options.open ?? (options.inline ? true : (options.defaultOpen ?? true));
    this.snapshot = this.buildSnapshot();
  }

  private parseRange(
    range: { start: DateTimeValue; end: DateTimeValue } | null | undefined,
    format: string
  ): { start: Dayjs | null; end: Dayjs | null } {
    return {
      start: parseValue(range?.start ?? null, format),
      end: parseValue(range?.end ?? null, format),
    };
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): RangeSnapshot => this.snapshot;
  getServerSnapshot = (): RangeSnapshot => this.snapshot;

  private sameDay(a: Dayjs | null, b: Dayjs | null): boolean {
    if (a === null && b === null) {
      return true;
    }
    if (a === null || b === null) {
      return false;
    }
    return a.isSame(b, "day");
  }

  setOptions(partial: Partial<DateTimeRangeOptions>): void {
    this.options = { ...this.options, ...partial };
    if (partial.open !== undefined) {
      this.open = partial.open;
    }
    if ("value" in partial) {
      if (partial.value === null) {
        this.start = null;
        this.end = null;
        this.hoverEnd = null;
      } else if (partial.value !== undefined) {
        const format = this.options.format ?? DATE_FORMAT;
        const parsed = this.parseRange(partial.value, format);
        const unchanged =
          this.sameDay(parsed.start, this.start) &&
          this.sameDay(parsed.end, this.end);
        if (!unchanged) {
          this.start = parsed.start;
          this.end = parsed.end;
          if (parsed.start) {
            this.viewMonth = parsed.start.startOf("month");
            this.focusedDay = parsed.start;
          }
        }
      }
    }
    this.emit();
  }

  private getLabels(): Required<DateTimeLabels> {
    return { ...DEFAULT_LABELS, ...this.options.labels };
  }

  private emit(): void {
    this.snapshot = this.buildSnapshot();
    this.listeners.forEach((l) => l());
  }

  private buildSnapshot(): RangeSnapshot {
    const format = this.options.format ?? DATE_FORMAT;
    const weekStartsOn = (this.options.weekStartsOn ?? 0) as
      | 0
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6;
    const locale = this.options.locale ?? "en";
    const weeks = buildCalendarMonth({
      viewMonth: this.viewMonth,
      rangeStart: this.start,
      rangeEnd: this.end,
      hoverEnd: this.start && !this.end ? this.hoverEnd : null,
      minDate: this.options.minDate,
      maxDate: this.options.maxDate,
      disablePastDates: this.options.disablePastDates,
      disableFutureDates: this.options.disableFutureDates,
      weekStartsOn,
    });

    return {
      start: this.start,
      end: this.end,
      hoverEnd: this.hoverEnd,
      viewMonth: this.viewMonth,
      focusedDay: this.focusedDay,
      calPanel: this.calPanel,
      open: this.open,
      inline: Boolean(this.options.inline),
      format,
      asString: this.options.asString,
      weekStartsOn,
      locale,
      labels: this.getLabels(),
      className: this.options.className,
      weeks,
      weekdayLabels: getWeekdayLabels(locale, weekStartsOn),
    };
  }

  setOpen(open: boolean): void {
    if (this.options.inline) {
      return;
    }
    this.open = open;
    this.options.onOpenChange?.(open);
    this.emit();
  }

  close(): void {
    if (!this.options.inline) {
      this.setOpen(false);
    }
  }

  setCalPanel(panel: CalendarPanel): void {
    this.calPanel = panel;
    this.emit();
  }

  setViewMonth(next: Dayjs | ((prev: Dayjs) => Dayjs)): void {
    this.viewMonth = typeof next === "function" ? next(this.viewMonth) : next;
    this.emit();
  }

  navigatePrev(): void {
    if (this.calPanel === "day") {
      this.viewMonth = this.viewMonth.subtract(1, "month");
    } else if (this.calPanel === "month") {
      this.viewMonth = this.viewMonth.subtract(1, "year");
    } else {
      this.viewMonth = this.viewMonth.subtract(12, "year");
    }
    this.emit();
  }

  navigateNext(): void {
    if (this.calPanel === "day") {
      this.viewMonth = this.viewMonth.add(1, "month");
    } else if (this.calPanel === "month") {
      this.viewMonth = this.viewMonth.add(1, "year");
    } else {
      this.viewMonth = this.viewMonth.add(12, "year");
    }
    this.emit();
  }

  selectMonth(monthIndex: number): void {
    this.viewMonth = this.viewMonth.month(monthIndex);
    this.calPanel = "day";
    this.emit();
  }

  selectYear(year: number): void {
    this.viewMonth = this.viewMonth.year(year);
    this.calPanel = "month";
    this.emit();
  }

  private emitRange(nextStart: Dayjs | null, nextEnd: Dayjs | null): void {
    if (this.options.asString === false) {
      this.options.onChange?.({
        start: nextStart ? nextStart.toDate() : null,
        end: nextEnd ? nextEnd.toDate() : null,
      });
    } else {
      if (this.options.asString === undefined) {
        warnAsStringDeprecation();
      }
      const format = this.options.format ?? DATE_FORMAT;
      this.options.onChange?.({
        start: formatValue(nextStart, format),
        end: formatValue(nextEnd, format),
      });
    }
  }

  pickDay(day: Dayjs): void {
    if (!this.start || (this.start && this.end)) {
      this.start = day;
      this.end = null;
      this.hoverEnd = null;
      this.focusedDay = day;
    } else if (day.isBefore(this.start, "day")) {
      this.start = day;
      this.end = null;
      this.hoverEnd = null;
      this.focusedDay = day;
    } else {
      this.end = day;
      this.hoverEnd = null;
      this.focusedDay = day;
    }
    this.emit();
    if (this.options.asString === false) {
      this.emitRange(this.start, this.end);
    } else if (this.options.inline && this.start && this.end) {
      this.emitRange(this.start, this.end);
    }
  }

  setHoverEnd(day: Dayjs | null): void {
    if (this.start && !this.end) {
      this.hoverEnd = day;
      this.emit();
    }
  }

  handleGridKeyDown(key: string): boolean {
    const snap = this.snapshot;
    let next = this.focusedDay;
    switch (key) {
      case "ArrowLeft":
        next = this.focusedDay.subtract(1, "day");
        break;
      case "ArrowRight":
        next = this.focusedDay.add(1, "day");
        break;
      case "ArrowUp":
        next = this.focusedDay.subtract(7, "day");
        break;
      case "ArrowDown":
        next = this.focusedDay.add(7, "day");
        break;
      case "Home":
        next = startOfWeek(this.focusedDay, snap.weekStartsOn);
        break;
      case "End":
        next = endOfWeek(this.focusedDay, snap.weekStartsOn);
        break;
      case "PageUp":
        next = this.focusedDay.subtract(1, "month");
        this.viewMonth = next.startOf("month");
        break;
      case "PageDown":
        next = this.focusedDay.add(1, "month");
        this.viewMonth = next.startOf("month");
        break;
      case "Enter":
      case " ": {
        const cell = snap.weeks
          .flat()
          .find((d) => d.date.isSame(this.focusedDay, "day"));
        if (cell && !cell.isDisabled && cell.isCurrentMonth) {
          this.pickDay(cell.date);
        }
        return true;
      }
      default:
        return false;
    }
    this.focusedDay = next;
    if (!next.isSame(this.viewMonth, "month")) {
      this.viewMonth = next.startOf("month");
    }
    this.emit();
    return true;
  }

  confirm(): DateRangeValue | null {
    if (!this.start || !this.end) {
      return null;
    }
    this.emitRange(this.start, this.end);
    this.close();
    return {
      start: this.start.toDate(),
      end: this.end.toDate(),
    };
  }

  clear(): void {
    this.start = null;
    this.end = null;
    this.hoverEnd = null;
    this.emitRange(null, null);
    this.emit();
    this.close();
  }
}

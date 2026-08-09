import {
  buildCalendarMonth,
  canNavigateNext,
  canNavigatePrev,
  clampToSelectableDate,
  clampViewMonth,
  isMonthSelectable,
  isYearSelectable,
  resolveSelectableRange,
} from "./logic/calendar";
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
  type Dayjs,
} from "./logic/date";
import type { CalendarDay, CalendarPanel } from "./types";
import type { Listener } from "./controller";

/** Immutable view model for rendering a range picker ({@link RangeController.getSnapshot}). */
export interface RangeSnapshot {
  /** Committed or in-progress range start. */
  start: Dayjs | null;
  /** Committed or in-progress range end. */
  end: Dayjs | null;
  /** Tentative end while hovering during selection. */
  hoverEnd: Dayjs | null;
  /** Calendar month currently displayed. */
  viewMonth: Dayjs;
  /** Keyboard-focused calendar day. */
  focusedDay: Dayjs;
  /** Day / month / year drill-down panel. */
  calPanel: CalendarPanel;
  /** Whether a non-inline modal overlay is open. */
  open: boolean;
  /** True when rendered inline (always open). */
  inline: boolean;
  /** Format string used for parse/format/`asString` commits. */
  format: string;
  /** Current `asString` option (`undefined` means `Date` payloads). */
  asString: boolean | undefined;
  /** First day of the week (`0` Sunday … `6` Saturday). */
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Active dayjs locale code. */
  locale: string;
  /** Resolved UI labels (defaults merged with overrides). */
  labels: Required<DateTimeLabels>;
  /** Extra class name on the picker root. */
  className?: string;
  /** 6×7 month grid for the current `viewMonth`. */
  weeks: CalendarDay[][];
  /** Localized weekday header labels for the grid. */
  weekdayLabels: string[];
  /** Whether previous month/year navigation is allowed. */
  canNavigatePrev: boolean;
  /** Whether next month/year navigation is allowed. */
  canNavigateNext: boolean;
}

/**
 * Headless controller for a start/end date-range picker.
 *
 * Subscribe with {@link RangeController.subscribe} and read
 * {@link RangeController.getSnapshot}. Range pickers support inline and modal
 * overlays only (no popover/anchor).
 */
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
    const viewAnchor = clampToSelectableDate(
      parsed.start ?? dayjs(),
      this.getDayDisableOptions()
    );
    this.viewMonth = viewAnchor.startOf("month");
    this.focusedDay = viewAnchor;
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

  /** Register a listener; returns an unsubscribe function. */
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Current immutable snapshot for rendering. */
  getSnapshot = (): RangeSnapshot => this.snapshot;
  /** Stable snapshot reference for useSyncExternalStore. */
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
    const prev = this.options;
    this.options = { ...this.options, ...partial };
    if (partial.open !== undefined && partial.open !== prev.open) {
      if (!this.options.inline) {
        if (!partial.open) {
          this.calPanel = "day";
        }
        this.resetViewToCommitted();
      }
      this.open = partial.open;
    } else if (partial.open !== undefined) {
      this.open = partial.open;
    }
    if ("value" in partial) {
      if (partial.value === null) {
        this.start = null;
        this.end = null;
        this.hoverEnd = null;
        const fallback = clampToSelectableDate(dayjs(), this.getDayDisableOptions());
        this.viewMonth = fallback.startOf("month");
        this.focusedDay = fallback;
      } else if (partial.value !== undefined) {
        const format = this.options.format ?? DATE_FORMAT;
        const parsed = this.parseRange(partial.value, format);
        const unchanged =
          this.sameDay(parsed.start, this.start) &&
          this.sameDay(parsed.end, this.end);
        if (!unchanged) {
          this.start = parsed.start;
          this.end = parsed.end;
          const viewAnchor = clampToSelectableDate(
            parsed.start ?? dayjs(),
            this.getDayDisableOptions()
          );
          this.viewMonth = viewAnchor.startOf("month");
          this.focusedDay = viewAnchor;
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
      canNavigatePrev: canNavigatePrev(
        this.viewMonth,
        this.calPanel,
        this.getDayDisableOptions()
      ),
      canNavigateNext: canNavigateNext(
        this.viewMonth,
        this.calPanel,
        this.getDayDisableOptions()
      ),
    };
  }

  private getDayDisableOptions() {
    return {
      minDate: this.options.minDate,
      maxDate: this.options.maxDate,
      disablePastDates: this.options.disablePastDates,
      disableFutureDates: this.options.disableFutureDates,
      weekStartsOn: this.options.weekStartsOn ?? 0,
    };
  }

  /** Exposed for renderers that need month/year disable checks. */
  getDisableOptions() {
    return this.getDayDisableOptions();
  }

  private resetViewToCommitted(): void {
    const bounds = this.getDayDisableOptions();
    if (this.options.value === null) {
      const fallback = clampToSelectableDate(dayjs(), bounds);
      this.viewMonth = fallback.startOf("month");
      this.focusedDay = fallback;
      return;
    }

    const format = this.options.format ?? DATE_FORMAT;
    const parsed = this.parseRange(
      this.options.value ?? this.options.defaultValue,
      format
    );
    const viewAnchor = clampToSelectableDate(
      parsed.start ?? dayjs(),
      bounds
    );
    this.viewMonth = viewAnchor.startOf("month");
    this.focusedDay = viewAnchor;
  }

  /**
   * Open or close a non-inline modal overlay. No-op when `inline`.
   *
   * @example
   * ```ts
   * rangeHandle.getController().setOpen(true);
   * ```
   */
  setOpen(open: boolean): void {
    if (this.options.inline) {
      return;
    }
    if (open) {
      this.resetViewToCommitted();
    } else {
      this.calPanel = "day";
      this.resetViewToCommitted();
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
    const raw = typeof next === "function" ? next(this.viewMonth) : next;
    this.viewMonth = clampViewMonth(raw, this.getDayDisableOptions());
    this.emit();
  }

  navigatePrev(): void {
    if (
      !canNavigatePrev(this.viewMonth, this.calPanel, this.getDayDisableOptions())
    ) {
      return;
    }
    if (this.calPanel === "day") {
      this.viewMonth = this.viewMonth.subtract(1, "month");
    } else if (this.calPanel === "month") {
      this.viewMonth = this.viewMonth.subtract(1, "year");
    } else {
      this.viewMonth = this.viewMonth.subtract(12, "year");
    }
    this.viewMonth = clampViewMonth(this.viewMonth, this.getDayDisableOptions());
    this.emit();
  }

  navigateNext(): void {
    if (
      !canNavigateNext(this.viewMonth, this.calPanel, this.getDayDisableOptions())
    ) {
      return;
    }
    if (this.calPanel === "day") {
      this.viewMonth = this.viewMonth.add(1, "month");
    } else if (this.calPanel === "month") {
      this.viewMonth = this.viewMonth.add(1, "year");
    } else {
      this.viewMonth = this.viewMonth.add(12, "year");
    }
    this.viewMonth = clampViewMonth(this.viewMonth, this.getDayDisableOptions());
    this.emit();
  }

  selectMonth(monthIndex: number): void {
    const candidate = this.viewMonth.month(monthIndex);
    if (!isMonthSelectable(candidate, this.getDayDisableOptions())) {
      return;
    }
    this.viewMonth = clampViewMonth(candidate, this.getDayDisableOptions());
    this.calPanel = "day";
    this.emit();
  }

  selectYear(year: number): void {
    if (!isYearSelectable(year, this.getDayDisableOptions())) {
      return;
    }
    const candidate = this.viewMonth.year(year);
    this.viewMonth = clampViewMonth(candidate, this.getDayDisableOptions());
    this.calPanel = "month";
    this.emit();
  }

  private emitRange(nextStart: Dayjs | null, nextEnd: Dayjs | null): void {
    if (this.options.asString === true) {
      const format = this.options.format ?? DATE_FORMAT;
      this.options.onChange?.({
        start: formatValue(nextStart, format),
        end: formatValue(nextEnd, format),
      });
      return;
    }
    this.options.onChange?.({
      start: nextStart ? nextStart.toDate() : null,
      end: nextEnd ? nextEnd.toDate() : null,
    });
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
    this.emitRange(this.start, this.end);
    if (!this.options.inline && this.start && this.end) {
      this.close();
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
        break;
      case "PageDown":
        next = this.focusedDay.add(1, "month");
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
    const bounds = this.getDayDisableOptions();
    const range = resolveSelectableRange(bounds);
    if (range.min && next.isBefore(range.min, "day")) {
      next = range.min;
    }
    if (range.max && next.isAfter(range.max, "day")) {
      next = range.max;
    }
    this.focusedDay = next;
    this.viewMonth = clampViewMonth(next, bounds);
    this.emit();
    return true;
  }

  /** Commit a complete start/end range via `onChange`, then close. Returns `null` if incomplete. */
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

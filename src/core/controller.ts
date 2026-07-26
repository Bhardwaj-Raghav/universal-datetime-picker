import { buildCalendarMonth } from "./logic/calendar";
import type {
  CalendarDay,
  CalendarPanel,
  DateTimeBaseOptions,
  DateTimeChangeValue,
  DateTimeLabels,
  DateTimeLayout,
  DateTimeMode,
} from "./types";
import { DEFAULT_LABELS } from "./types";
import {
  HOURS_12,
  HOURS_24,
  MINUTES,
  buildTimeValue,
  dayjs,
  endOfWeek,
  formatValue,
  getWeekdayLabels,
  parseValue,
  resolveFormat,
  startOfWeek,
  to12Hour,
  to24Hour,
  warnAsStringDeprecation,
  type Dayjs,
} from "./logic/date";

export type Listener = () => void;

export interface PickerSnapshot {
  draft: Dayjs;
  viewMonth: Dayjs;
  calPanel: CalendarPanel;
  tab: "date" | "time";
  showHours: boolean;
  showMinutes: boolean;
  showSecondsOpen: boolean;
  showAmPm: boolean;
  focusedDay: Dayjs;
  open: boolean;
  mode: DateTimeMode;
  layout: DateTimeLayout;
  showSeconds: boolean;
  use12Hours: boolean;
  inline: boolean;
  popover: boolean;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale: string;
  labels: Required<DateTimeLabels>;
  resolvedFormat: string;
  asString: boolean | undefined;
  className?: string;
  theme?: "light" | "dark";
  weeks: CalendarDay[][];
  weekdayLabels: string[];
  showDate: boolean;
  showTime: boolean;
  useTabs: boolean;
  showDatePanel: boolean;
  showTimePanel: boolean;
  showModeTabs: boolean;
  hour24: number;
  hour12: number;
  isAm: boolean;
  hourOptions: string[];
  displayHour: string;
  displayMinute: string;
  displaySecond: string;
  minuteOptions: string[];
}

function padDisplay(n: number): string {
  return String(n).padStart(2, "0");
}

export type PickerControllerOptions = DateTimeBaseOptions;

export class PickerController {
  private listeners = new Set<Listener>();
  private options: PickerControllerOptions;
  private draft: Dayjs;
  private viewMonth: Dayjs;
  private calPanel: CalendarPanel = "day";
  private tab: "date" | "time";
  private showHours = false;
  private showMinutes = false;
  private showSecondsOpen = false;
  private showAmPm = false;
  private focusedDay: Dayjs;
  private open: boolean;
  private snapshot: PickerSnapshot;

  constructor(options: PickerControllerOptions = {}) {
    this.options = { ...options };
    const mode = options.mode ?? "datetime";
    const showSeconds = options.showSeconds !== false;
    const use12Hours = Boolean(options.use12Hours);
    const format = resolveFormat({
      mode,
      format: options.format,
      use12Hours,
      showSeconds,
    });
    const initial =
      parseValue(options.value ?? options.defaultValue ?? dayjs(), format) ??
      dayjs();

    this.draft = initial;
    this.viewMonth = initial.startOf("month");
    this.focusedDay = initial;
    this.tab = mode === "time" ? "time" : "date";
    this.open = options.open ?? (options.inline ? true : (options.defaultOpen ?? true));
    this.snapshot = this.buildSnapshot();
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): PickerSnapshot => this.snapshot;

  /** Stable for useSyncExternalStore — returns same reference until mutate. */
  getServerSnapshot = (): PickerSnapshot => this.snapshot;

  setOptions(partial: Partial<PickerControllerOptions>): void {
    const prev = this.options;
    this.options = { ...this.options, ...partial };

    if (partial.mode !== undefined && partial.mode !== prev.mode) {
      this.tab = partial.mode === "time" ? "time" : "date";
    }

    if (partial.open !== undefined) {
      this.open = partial.open;
    }

    if ("value" in partial) {
      if (partial.value === null) {
        const fallback = dayjs();
        this.draft = fallback;
        this.viewMonth = fallback.startOf("month");
        this.focusedDay = fallback;
      } else if (partial.value !== undefined) {
        const format = this.getResolvedFormat();
        const parsed = parseValue(partial.value, format);
        if (parsed) {
          this.draft = parsed;
          this.viewMonth = parsed.startOf("month");
          this.focusedDay = parsed;
        }
      }
    }

    this.emit();
  }

  private getResolvedFormat(): string {
    return resolveFormat({
      mode: this.options.mode ?? "datetime",
      format: this.options.format,
      use12Hours: Boolean(this.options.use12Hours),
      showSeconds: this.options.showSeconds !== false,
    });
  }

  private getLabels(): Required<DateTimeLabels> {
    return { ...DEFAULT_LABELS, ...this.options.labels };
  }

  private emit(): void {
    this.snapshot = this.buildSnapshot();
    this.listeners.forEach((l) => l());
  }

  private buildSnapshot(): PickerSnapshot {
    const mode = this.options.mode ?? "datetime";
    const layout = this.options.layout ?? "combined";
    const showSeconds = this.options.showSeconds !== false;
    const use12Hours = Boolean(this.options.use12Hours);
    const inline = Boolean(this.options.inline);
    const popover = Boolean(this.options.popover);
    const weekStartsOn = (this.options.weekStartsOn ?? 0) as
      | 0
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6;
    const locale = this.options.locale ?? "en";
    const resolvedFormat = this.getResolvedFormat();
    const labels = this.getLabels();

    const weeks = buildCalendarMonth({
      viewMonth: this.viewMonth,
      selected: this.draft,
      minDate: this.options.minDate,
      maxDate: this.options.maxDate,
      disablePastDates: this.options.disablePastDates,
      disableFutureDates: this.options.disableFutureDates,
      weekStartsOn,
    });

    const showDate = mode !== "time";
    const showTime = mode !== "date";
    const useTabs = mode === "datetime" && layout === "tabs";
    const showDatePanel = showDate && (!useTabs || this.tab === "date");
    const showTimePanel = showTime && (!useTabs || this.tab === "time");
    const hour24 = this.draft.hour();
    const { hour: hour12, isAm } = to12Hour(hour24);

    return {
      draft: this.draft,
      viewMonth: this.viewMonth,
      calPanel: this.calPanel,
      tab: this.tab,
      showHours: this.showHours,
      showMinutes: this.showMinutes,
      showSecondsOpen: this.showSecondsOpen,
      showAmPm: this.showAmPm,
      focusedDay: this.focusedDay,
      open: this.open,
      mode,
      layout,
      showSeconds,
      use12Hours,
      inline,
      popover,
      weekStartsOn,
      locale,
      labels,
      resolvedFormat,
      asString: this.options.asString,
      className: this.options.className,
      theme: this.options.theme,
      weeks,
      weekdayLabels: getWeekdayLabels(locale, weekStartsOn),
      showDate,
      showTime,
      useTabs,
      showDatePanel,
      showTimePanel,
      showModeTabs: useTabs,
      hour24,
      hour12,
      isAm,
      hourOptions: use12Hours ? HOURS_12 : HOURS_24,
      displayHour: use12Hours ? padDisplay(hour12) : padDisplay(hour24),
      displayMinute: padDisplay(this.draft.minute()),
      displaySecond: padDisplay(this.draft.second()),
      minuteOptions: MINUTES,
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

  setTab(tab: "date" | "time"): void {
    this.tab = tab;
    this.emit();
  }

  setCalPanel(panel: CalendarPanel): void {
    this.calPanel = panel;
    this.emit();
  }

  setViewMonth(next: Dayjs | ((prev: Dayjs) => Dayjs)): void {
    this.viewMonth = typeof next === "function" ? next(this.viewMonth) : next;
    this.emit();
  }

  selectDay(day: Dayjs): void {
    this.draft = this.draft
      .year(day.year())
      .month(day.month())
      .date(day.date());
    this.focusedDay = day;
    this.emit();
  }

  setHour(hourValue: number): void {
    this.draft = this.draft.hour(hourValue);
    this.emit();
  }

  setMinute(minute: number): void {
    this.draft = this.draft.minute(minute);
    this.emit();
  }

  setSecond(second: number): void {
    this.draft = this.draft.second(second);
    this.emit();
  }

  setAmPm(isAm: boolean): void {
    const { hour } = to12Hour(this.draft.hour());
    this.draft = this.draft.hour(to24Hour(hour, isAm));
    this.emit();
  }

  toggleHours(): void {
    this.showHours = !this.showHours;
    this.showMinutes = false;
    this.showSecondsOpen = false;
    this.showAmPm = false;
    this.emit();
  }

  toggleMinutes(): void {
    this.showMinutes = !this.showMinutes;
    this.showHours = false;
    this.showSecondsOpen = false;
    this.showAmPm = false;
    this.emit();
  }

  toggleSeconds(): void {
    this.showSecondsOpen = !this.showSecondsOpen;
    this.showHours = false;
    this.showMinutes = false;
    this.showAmPm = false;
    this.emit();
  }

  toggleAmPm(): void {
    this.showAmPm = !this.showAmPm;
    this.showHours = false;
    this.showMinutes = false;
    this.showSecondsOpen = false;
    this.emit();
  }

  closeTimeColumns(): void {
    this.showHours = false;
    this.showMinutes = false;
    this.showSecondsOpen = false;
    this.showAmPm = false;
    this.emit();
  }

  selectHourOption(opt: string): void {
    const snap = this.snapshot;
    if (snap.use12Hours) {
      this.draft = this.draft.hour(to24Hour(Number(opt), snap.isAm));
    } else {
      this.draft = this.draft.hour(Number(opt));
    }
    this.showHours = false;
    this.emit();
  }

  selectMinuteOption(opt: string): void {
    this.draft = this.draft.minute(Number(opt));
    this.showMinutes = false;
    this.emit();
  }

  selectSecondOption(opt: string): void {
    this.draft = this.draft.second(Number(opt));
    this.showSecondsOpen = false;
    this.emit();
  }

  selectAmPmOption(opt: string): void {
    const { hour } = to12Hour(this.draft.hour());
    this.draft = this.draft.hour(to24Hour(hour, opt === "AM"));
    this.showAmPm = false;
    this.emit();
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
          this.selectDay(cell.date);
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

  confirm(): DateTimeChangeValue {
    const snap = this.snapshot;
    let payload: DateTimeChangeValue;
    if (snap.asString === false) {
      if (snap.mode === "time") {
        payload = buildTimeValue(this.draft, snap.resolvedFormat);
      } else if (snap.mode === "date") {
        payload = this.draft.startOf("day").toDate();
      } else {
        payload = this.draft.toDate();
      }
    } else {
      if (snap.asString === undefined) {
        warnAsStringDeprecation();
      }
      payload = formatValue(this.draft, snap.resolvedFormat);
    }
    this.options.onChange?.(payload);
    this.close();
    return payload;
  }

  clear(): void {
    this.options.onChange?.(null);
    this.close();
  }

  /** Year window helpers for month/year panels */
  yearWindowStart(year: number): number {
    return Math.floor(year / 12) * 12;
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
}

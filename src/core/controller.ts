import {
  buildCalendarMonth,
  canNavigateNext,
  canNavigatePrev,
  clampToSelectableDate,
  clampViewMonth,
  isDayDisabled,
  isMonthSelectable,
  isYearSelectable,
  resolveSelectableRange,
} from "./logic/calendar";
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
  type Dayjs,
} from "./logic/date";

/** Subscriber notified when the controller snapshot changes. */
export type Listener = () => void;

/** Immutable view model for rendering a single picker (from {@link PickerController.getSnapshot}). */
export interface PickerSnapshot {
  /** Working draft datetime being edited. */
  draft: Dayjs;
  /** Calendar month currently displayed. */
  viewMonth: Dayjs;
  /** Day / month / year drill-down panel. */
  calPanel: CalendarPanel;
  /** Active date vs time tab when `layout="tabs"`. */
  tab: "date" | "time";
  /** Whether the hour column popover is open. */
  showHours: boolean;
  /** Whether the minute column popover is open. */
  showMinutes: boolean;
  /** Whether the seconds column popover is open. */
  showSecondsOpen: boolean;
  /** Whether the AM/PM column popover is open. */
  showAmPm: boolean;
  /** Keyboard-focused calendar day. */
  focusedDay: Dayjs;
  /** Whether a non-inline overlay/popover is open. */
  open: boolean;
  /** Active selection mode. */
  mode: DateTimeMode;
  /** Datetime panel arrangement. */
  layout: DateTimeLayout;
  /** Whether seconds are enabled in the time UI. */
  showSeconds: boolean;
  /** Whether the time UI uses a 12-hour clock. */
  use12Hours: boolean;
  /** True when rendered inline (always open). */
  inline: boolean;
  /** True when positioned as a popover beside an anchor. */
  popover: boolean;
  /** First day of the week (`0` Sunday … `6` Saturday). */
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Active dayjs locale code. */
  locale: string;
  /** Resolved UI labels (defaults merged with overrides). */
  labels: Required<DateTimeLabels>;
  /** Format string used for parse/format/`asString` commits. */
  resolvedFormat: string;
  /** Current `asString` option (`undefined` means object/`Date` payloads). */
  asString: boolean | undefined;
  /** Extra class name on the picker root. */
  className?: string;
  /** Active theme attribute. */
  theme?: "light" | "dark";
  /** 6×7 month grid for the current `viewMonth`. */
  weeks: CalendarDay[][];
  /** Localized weekday header labels for the grid. */
  weekdayLabels: string[];
  /** Whether the date calendar should be shown for this mode. */
  showDate: boolean;
  /** Whether the time columns should be shown for this mode. */
  showTime: boolean;
  /** True when datetime mode uses tabbed date/time panels. */
  useTabs: boolean;
  /** Whether the date panel is visible in the current tab/layout. */
  showDatePanel: boolean;
  /** Whether the time panel is visible in the current tab/layout. */
  showTimePanel: boolean;
  /** Whether Date/Time mode tabs are shown. */
  showModeTabs: boolean;
  /** Draft hour in 0–23. */
  hour24: number;
  /** Draft hour in 1–12. */
  hour12: number;
  /** Whether the draft time is AM. */
  isAm: boolean;
  /** Selectable hour option strings for the current clock mode. */
  hourOptions: string[];
  /** Zero-padded hour shown in the time UI. */
  displayHour: string;
  /** Zero-padded minute shown in the time UI. */
  displayMinute: string;
  /** Zero-padded second shown in the time UI. */
  displaySecond: string;
  /** Selectable minute option strings (`00`–`59`). */
  minuteOptions: string[];
  /** Whether previous month/year navigation is allowed. */
  canNavigatePrev: boolean;
  /** Whether next month/year navigation is allowed. */
  canNavigateNext: boolean;
}

function padDisplay(n: number): string {
  return String(n).padStart(2, "0");
}

/** Options accepted by {@link PickerController} (same as {@link DateTimeBaseOptions}). */
export type PickerControllerOptions = DateTimeBaseOptions;

/**
 * Headless controller for a single date/time picker.
 *
 * Subscribe with {@link PickerController.subscribe}, read
 * {@link PickerController.getSnapshot}, and drive UI via methods such as
 * {@link PickerController.setOpen}, {@link PickerController.selectDay}, and
 * {@link PickerController.confirm}.
 */
export class PickerController {
  private listeners = new Set<Listener>();
  private options: PickerControllerOptions;
  private draft!: Dayjs;
  private viewMonth!: Dayjs;
  private calPanel: CalendarPanel = "day";
  private tab: "date" | "time";
  private showHours = false;
  private showMinutes = false;
  private showSecondsOpen = false;
  private showAmPm = false;
  private focusedDay!: Dayjs;
  /** Set only when a value exists or the user picks a day (date/datetime modes). */
  private selectedDay: Dayjs | null = null;
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
    const committed = this.parseCommittedValue(options, format);
    if (committed) {
      this.selectedDay = committed;
      this.syncDraftAndView(committed);
    } else {
      this.selectedDay = null;
      const anchor =
        mode === "time"
          ? dayjs()
          : clampToSelectableDate(dayjs(), {
              minDate: options.minDate,
              maxDate: options.maxDate,
              disablePastDates: options.disablePastDates,
              disableFutureDates: options.disableFutureDates,
              weekStartsOn: options.weekStartsOn ?? 0,
            });
      this.syncDraftAndView(anchor);
    }
    this.tab = mode === "time" ? "time" : "date";
    this.open = options.open ?? (options.inline ? true : (options.defaultOpen ?? true));
    this.snapshot = this.buildSnapshot();
  }

  /** Register a listener; returns an unsubscribe function. */
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Current immutable snapshot for rendering. */
  getSnapshot = (): PickerSnapshot => this.snapshot;

  /** Stable for useSyncExternalStore - returns same reference until mutate. */
  getServerSnapshot = (): PickerSnapshot => this.snapshot;

  /** Merge options and refresh the snapshot (e.g. controlled `value` / `open`). */
  setOptions(partial: Partial<PickerControllerOptions>): void {
    const prev = this.options;
    this.options = { ...this.options, ...partial };

    if (partial.mode !== undefined && partial.mode !== prev.mode) {
      this.tab = partial.mode === "time" ? "time" : "date";
    }

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
        this.selectedDay = null;
        const mode = this.options.mode ?? "datetime";
        const fallback =
          mode === "time"
            ? dayjs()
            : clampToSelectableDate(dayjs(), this.getDayDisableOptions());
        this.syncDraftAndView(fallback);
      } else if (partial.value !== undefined) {
        const format = this.getResolvedFormat();
        const parsed = parseValue(partial.value, format);
        if (parsed) {
          this.selectedDay = parsed;
          this.syncDraftAndView(parsed);
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
      selected: this.selectedDay,
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

  private parseCommittedValue(
    options: PickerControllerOptions,
    format: string
  ): Dayjs | null {
    if (options.value === null) {
      return null;
    }
    const raw = options.value ?? options.defaultValue;
    if (raw === undefined || raw === null || raw === "") {
      return null;
    }
    return parseValue(raw, format);
  }

  private parseCommittedFromCurrentOptions(): Dayjs | null {
    return this.parseCommittedValue(this.options, this.getResolvedFormat());
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

  private syncDraftAndView(raw: Dayjs): void {
    const mode = this.options.mode ?? "datetime";
    this.draft = raw;
    if (mode === "time") {
      this.viewMonth = raw.startOf("month");
      this.focusedDay = raw.startOf("day");
      return;
    }
    const viewAnchor = clampToSelectableDate(raw, this.getDayDisableOptions());
    this.viewMonth = viewAnchor.startOf("month");
    this.focusedDay = viewAnchor;
  }

  private resetViewToCommitted(): void {
    const committed = this.parseCommittedFromCurrentOptions();
    if (committed) {
      this.selectedDay = committed;
      this.syncDraftAndView(committed);
      return;
    }

    this.selectedDay = null;
    const mode = this.options.mode ?? "datetime";
    const anchor =
      mode === "time"
        ? dayjs()
        : clampToSelectableDate(dayjs(), this.getDayDisableOptions());
    this.syncDraftAndView(anchor);
  }

  private isDraftDisabled(): boolean {
    const mode = this.options.mode ?? "datetime";
    if (mode === "time") {
      return false;
    }
    if (!this.selectedDay) {
      return true;
    }
    return isDayDisabled(this.selectedDay, this.getDayDisableOptions());
  }

  /**
   * Open or close a non-inline overlay/popover. No-op when `inline`.
   * Invokes `onOpenChange` and refreshes the snapshot.
   *
   * @example
   * ```ts
   * const controller = handle.getController();
   * controller.setOpen(true);
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

  /** Close a non-inline picker (`setOpen(false)`). */
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
    const raw = typeof next === "function" ? next(this.viewMonth) : next;
    this.viewMonth = clampViewMonth(raw, this.getDayDisableOptions());
    this.emit();
  }

  /** Overlay date-only (and all inline) commit immediately; datetime/time overlays wait for OK. */
  private shouldCommitImmediately(): boolean {
    if (this.options.inline) {
      return true;
    }
    return (this.options.mode ?? "datetime") === "date";
  }

  selectDay(day: Dayjs): void {
    this.selectedDay = day.startOf("day");
    this.draft = this.draft
      .year(day.year())
      .month(day.month())
      .date(day.date());
    this.focusedDay = day;
    this.emit();
    if (this.shouldCommitImmediately()) {
      this.maybeCommit();
      if (!this.options.inline) {
        this.close();
      }
    }
  }

  setHour(hourValue: number): void {
    this.draft = this.draft.hour(hourValue);
    this.emit();
    if (this.shouldCommitImmediately()) {
      this.maybeCommit();
    }
  }

  setMinute(minute: number): void {
    this.draft = this.draft.minute(minute);
    this.emit();
    if (this.shouldCommitImmediately()) {
      this.maybeCommit();
    }
  }

  setSecond(second: number): void {
    this.draft = this.draft.second(second);
    this.emit();
    if (this.shouldCommitImmediately()) {
      this.maybeCommit();
    }
  }

  setAmPm(isAm: boolean): void {
    const { hour } = to12Hour(this.draft.hour());
    this.draft = this.draft.hour(to24Hour(hour, isAm));
    this.emit();
    if (this.shouldCommitImmediately()) {
      this.maybeCommit();
    }
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
    if (this.shouldCommitImmediately()) {
      this.maybeCommit();
    }
  }

  selectMinuteOption(opt: string): void {
    this.draft = this.draft.minute(Number(opt));
    this.showMinutes = false;
    this.emit();
    if (this.shouldCommitImmediately()) {
      this.maybeCommit();
    }
  }

  selectSecondOption(opt: string): void {
    this.draft = this.draft.second(Number(opt));
    this.showSecondsOpen = false;
    this.emit();
    if (this.shouldCommitImmediately()) {
      this.maybeCommit();
    }
  }

  selectAmPmOption(opt: string): void {
    const { hour } = to12Hour(this.draft.hour());
    this.draft = this.draft.hour(to24Hour(hour, opt === "AM"));
    this.showAmPm = false;
    this.emit();
    if (this.shouldCommitImmediately()) {
      this.maybeCommit();
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
          this.selectDay(cell.date);
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

  private buildPayload(): DateTimeChangeValue {
    const snap = this.snapshot;
    if (snap.asString === true) {
      return formatValue(this.draft, snap.resolvedFormat);
    }
    if (snap.mode === "time") {
      return buildTimeValue(this.draft, snap.resolvedFormat);
    }
    if (snap.mode === "date") {
      return this.draft.startOf("day").toDate();
    }
    return this.draft.toDate();
  }

  private maybeCommit(): void {
    if (!this.options.onChange || this.isDraftDisabled()) {
      return;
    }
    const mode = this.options.mode ?? "datetime";
    if (mode !== "time" && !this.selectedDay) {
      return;
    }
    this.options.onChange(this.buildPayload());
  }

  /**
   * Commit the draft via `onChange`, close a non-inline picker, and return the payload.
   */
  confirm(): DateTimeChangeValue {
    const payload = this.buildPayload();
    if (!this.isDraftDisabled()) {
      this.options.onChange?.(payload);
    }
    this.close();
    return payload;
  }

  /** Clear the selection and notify `onChange` with `null` when applicable. */
  clear(): void {
    this.selectedDay = null;
    const mode = this.options.mode ?? "datetime";
    const anchor =
      mode === "time"
        ? dayjs()
        : clampToSelectableDate(dayjs(), this.getDayDisableOptions());
    this.syncDraftAndView(anchor);
    this.options.onChange?.(null);
    this.close();
  }

  /** Year window helpers for month/year panels */
  yearWindowStart(year: number): number {
    return Math.floor(year / 12) * 12;
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
}

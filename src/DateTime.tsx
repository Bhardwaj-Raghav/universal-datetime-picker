import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { CalendarHeader } from "./CalendarHeader";
import { buildCalendarMonth } from "./calendar";
import {
  useFocusTrap,
  useOnClickOutside,
  useOnEscape,
  usePopoverPosition,
} from "./hooks/useA11y";
import { useControllableState } from "./hooks/useControllableState";
import {
  DEFAULT_LABELS,
  type CalendarPanel,
  type DateTimeProps,
} from "./types";
import {
  HOURS_12,
  HOURS_24,
  MINUTES,
  buildTimeValue,
  dayjs,
  endOfWeek,
  formatLocalized,
  formatValue,
  getWeekdayLabels,
  parseValue,
  resolveFormat,
  startOfWeek,
  to12Hour,
  to24Hour,
  warnAsStringDeprecation,
  type Dayjs,
} from "./utils/date";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Resolve theme for portaled pickers (CSS vars don't cross portals). */
function resolveThemeAttr(
  theme: "light" | "dark" | undefined,
  anchorEl: HTMLElement | null | undefined
): "light" | "dark" | undefined {
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  let node: HTMLElement | null | undefined = anchorEl ?? null;
  while (node) {
    const attr = node.getAttribute("data-ctp-theme");
    if (attr === "dark" || attr === "light") {
      return attr;
    }
    node = node.parentElement;
  }
  if (typeof document !== "undefined") {
    const root = document.documentElement.getAttribute("data-ctp-theme");
    if (root === "dark" || root === "light") {
      return root;
    }
  }
  return undefined;
}

export function DateTime(props: DateTimeProps) {
  const {
    value,
    defaultValue,
    onChange,
    asString,
    showSeconds = true,
    format,
    mode = "datetime",
    layout = "combined",
    minDate,
    maxDate,
    disablePastDates = false,
    disableFutureDates = false,
    weekStartsOn = 0,
    use12Hours = false,
    inline = false,
    className,
    style,
    locale = "en",
    labels: labelsProp,
    theme,
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    anchorEl,
    popover = false,
  } = props;

  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelsProp }),
    [labelsProp]
  );

  const resolvedFormat = useMemo(
    () => resolveFormat({ mode, format, use12Hours, showSeconds }),
    [mode, format, use12Hours, showSeconds]
  );

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const initial =
    parseValue(value ?? defaultValue ?? dayjs(), resolvedFormat) ?? dayjs();

  const [draft, setDraft] = useState<Dayjs>(initial);
  const [viewMonth, setViewMonth] = useState<Dayjs>(initial.startOf("month"));
  const [calPanel, setCalPanel] = useState<CalendarPanel>("day");
  const [tab, setTab] = useState<"date" | "time">(
    mode === "time" ? "time" : "date"
  );
  const [showHours, setShowHours] = useState(false);
  const [showMinutes, setShowMinutes] = useState(false);
  const [showSecondsOpen, setShowSecondsOpen] = useState(false);
  const [showAmPm, setShowAmPm] = useState(false);
  const [focusedDay, setFocusedDay] = useState<Dayjs>(initial);

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: inline ? true : defaultOpen,
    onChange: onOpenChange,
  });

  useEffect(() => {
    if (value === null) {
      const fallback = dayjs();
      setDraft(fallback);
      setViewMonth(fallback.startOf("month"));
      setFocusedDay(fallback);
      return;
    }
    const parsed = parseValue(value ?? null, resolvedFormat);
    if (parsed) {
      setDraft(parsed);
      setViewMonth(parsed.startOf("month"));
      setFocusedDay(parsed);
    }
  }, [value, resolvedFormat]);

  useEffect(() => {
    setTab(mode === "time" ? "time" : "date");
  }, [mode]);

  const close = useCallback(() => {
    if (!inline) {
      setOpen(false);
    }
  }, [inline, setOpen]);

  const confirm = useCallback(() => {
    if (asString === false) {
      if (mode === "time") {
        onChange?.(buildTimeValue(draft, resolvedFormat));
      } else if (mode === "date") {
        onChange?.(draft.startOf("day").toDate());
      } else {
        onChange?.(draft.toDate());
      }
    } else {
      if (asString === undefined) {
        warnAsStringDeprecation();
      }
      onChange?.(formatValue(draft, resolvedFormat));
    }
    close();
  }, [asString, close, draft, mode, onChange, resolvedFormat]);

  const clearAndClose = useCallback(() => {
    onChange?.(null);
    close();
  }, [close, onChange]);

  useOnEscape(close, open && !inline);
  useFocusTrap(dialogRef, open && !inline);
  useOnClickOutside(close, open && !inline && popover, dialogRef, anchorEl);

  const position = usePopoverPosition(
    anchorEl,
    open && !inline,
    popover,
    dialogRef
  );

  const weeks = useMemo(
    () =>
      buildCalendarMonth({
        viewMonth,
        selected: draft,
        minDate,
        maxDate,
        disablePastDates,
        disableFutureDates,
        weekStartsOn,
      }),
    [
      viewMonth,
      draft,
      minDate,
      maxDate,
      disablePastDates,
      disableFutureDates,
      weekStartsOn,
    ]
  );

  const weekdayLabels = useMemo(
    () => getWeekdayLabels(locale, weekStartsOn),
    [locale, weekStartsOn]
  );

  const selectDay = useCallback((day: Dayjs) => {
    setDraft((prev) =>
      prev.year(day.year()).month(day.month()).date(day.date())
    );
    setFocusedDay(day);
  }, []);

  const setHour = useCallback((hourValue: number) => {
    setDraft((prev) => prev.hour(hourValue));
  }, []);

  const setMinute = useCallback((minute: number) => {
    setDraft((prev) => prev.minute(minute));
  }, []);

  const setSecond = useCallback((second: number) => {
    setDraft((prev) => prev.second(second));
  }, []);

  const onGridKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next = focusedDay;
    switch (event.key) {
      case "ArrowLeft":
        next = focusedDay.subtract(1, "day");
        break;
      case "ArrowRight":
        next = focusedDay.add(1, "day");
        break;
      case "ArrowUp":
        next = focusedDay.subtract(7, "day");
        break;
      case "ArrowDown":
        next = focusedDay.add(7, "day");
        break;
      case "Home":
        next = startOfWeek(focusedDay, weekStartsOn);
        break;
      case "End":
        next = endOfWeek(focusedDay, weekStartsOn);
        break;
      case "PageUp":
        next = focusedDay.subtract(1, "month");
        setViewMonth(next.startOf("month"));
        break;
      case "PageDown":
        next = focusedDay.add(1, "month");
        setViewMonth(next.startOf("month"));
        break;
      case "Enter":
      case " ": {
        event.preventDefault();
        const cell = weeks.flat().find((d) => d.date.isSame(focusedDay, "day"));
        if (cell && !cell.isDisabled && cell.isCurrentMonth) {
          selectDay(cell.date);
        }
        return;
      }
      default:
        return;
    }
    event.preventDefault();
    setFocusedDay(next);
    if (!next.isSame(viewMonth, "month")) {
      setViewMonth(next.startOf("month"));
    }
  };

  const hour24 = draft.hour();
  const { hour: hour12, isAm } = to12Hour(hour24);
  const hourOptions = use12Hours ? HOURS_12 : HOURS_24;
  const displayHour = use12Hours ? padDisplay(hour12) : padDisplay(hour24);

  const onBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      close();
    }
  };

  if (!open && !inline) {
    return null;
  }

  const showDate = mode !== "time";
  const showTime = mode !== "date";
  const useTabs = mode === "datetime" && layout === "tabs";
  const showDatePanel = showDate && (!useTabs || tab === "date");
  const showTimePanel = showTime && (!useTabs || tab === "time");
  const showModeTabs = useTabs;
  const themeAttr = resolveThemeAttr(theme, anchorEl);

  const pickerStyle =
    popover && !inline
      ? {
          ...style,
          position: "fixed" as const,
          top: position?.top ?? 80,
          left: position?.left ?? 16,
        }
      : style;

  const datePanel = (
    <div className="ctp-body ctp-body-calendar-date">
      <CalendarHeader
        viewMonth={viewMonth}
        setViewMonth={setViewMonth}
        panel={calPanel}
        onPanelChange={setCalPanel}
        locale={locale}
        labels={labels}
        titleId={showDatePanel ? titleId : undefined}
      />
      {calPanel === "day" && (
        <div
          className="ctp-main-calendar"
          role="grid"
          aria-label={labels.chooseDate}
          tabIndex={0}
          onKeyDown={onGridKeyDown}
        >
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="ctp-box ctp-box-days"
              role="columnheader"
            >
              {label}
            </div>
          ))}
          {weeks.map((week) =>
            week.map((dayData) => {
              const selected = dayData.isSelected;
              const focused = dayData.date.isSame(focusedDay, "day");
              const disabled = !dayData.isCurrentMonth || dayData.isDisabled;
              return (
                <button
                  key={dayData.date.format("YYYY-MM-DD")}
                  type="button"
                  role="gridcell"
                  tabIndex={focused ? 0 : -1}
                  aria-selected={selected}
                  aria-disabled={disabled}
                  disabled={disabled}
                  aria-label={formatLocalized(
                    dayData.date,
                    "dddd, MMMM D, YYYY",
                    locale
                  )}
                  className={cx(
                    "ctp-box",
                    "ctp-box-date",
                    !dayData.isCurrentMonth && "not-current-month",
                    selected && "selected",
                    dayData.isDisabled && "disabled-date",
                    dayData.isWeekend && "weekend-day",
                    dayData.isCurrentDate && "ctp-today",
                    dayData.isInRange && "ctp-in-range",
                    dayData.isRangeStart && "ctp-range-start",
                    dayData.isRangeEnd && "ctp-range-end"
                  )}
                  onClick={() => {
                    if (!disabled) {
                      selectDay(dayData.date);
                    }
                  }}
                >
                  {dayData.date.format("D")}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );

  const timePanel = (
    <div className="ctp-body ctp-body-calendar-time">
      {showDatePanel && (
        <div className="ctp-section-label">{labels.time}</div>
      )}
      {!showDatePanel && (
        <span className="ctp-visually-hidden" id={titleId}>
          {labels.time}
        </span>
      )}
      <div className="ctp-main-time">
        <div className="ctp-main-time-header">
          <div className="ctp-box">Hr</div>
          <div className="ctp-box">Min</div>
          {showSeconds && <div className="ctp-box">Sec</div>}
          {use12Hours && <div className="ctp-box">AM/PM</div>}
        </div>
        <div className="ctp-main-time-body">
          <TimeColumn
            label="hours"
            open={showHours}
            onToggle={() => setShowHours((v) => !v)}
            display={displayHour}
            options={hourOptions}
            onSelect={(opt) => {
              if (use12Hours) {
                setHour(to24Hour(Number(opt), isAm));
              } else {
                setHour(Number(opt));
              }
              setShowHours(false);
            }}
          />
          <TimeColumn
            label="minutes"
            open={showMinutes}
            onToggle={() => setShowMinutes((v) => !v)}
            display={padDisplay(draft.minute())}
            options={MINUTES}
            onSelect={(opt) => {
              setMinute(Number(opt));
              setShowMinutes(false);
            }}
          />
          {showSeconds && (
            <TimeColumn
              label="seconds"
              open={showSecondsOpen}
              onToggle={() => setShowSecondsOpen((v) => !v)}
              display={padDisplay(draft.second())}
              options={MINUTES}
              onSelect={(opt) => {
                setSecond(Number(opt));
                setShowSecondsOpen(false);
              }}
            />
          )}
          {use12Hours && (
            <TimeColumn
              label="am-pm"
              open={showAmPm}
              onToggle={() => setShowAmPm((v) => !v)}
              display={isAm ? "AM" : "PM"}
              options={["AM", "PM"]}
              onSelect={(opt) => {
                setHour(to24Hour(hour12, opt === "AM"));
                setShowAmPm(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );

  const picker = (
    <div
      ref={dialogRef}
      className={cx(
        "ctp-calendar-time-picker",
        popover && !inline && "ctp-popover",
        use12Hours && "ctp-use-12h",
        mode === "time" && "ctp-mode-time",
        !showSeconds && "ctp-no-seconds",
        showDatePanel && showTimePanel && "ctp-layout-combined",
        className
      )}
      style={pickerStyle}
      data-ctp-theme={themeAttr}
      role={inline ? undefined : "dialog"}
      aria-modal={inline ? undefined : true}
      aria-labelledby={titleId}
    >
      {showModeTabs && (
        <div className="ctp-header">
          <div
            className="ctp-button-container"
            role="tablist"
            aria-label="Picker mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "date"}
              className={cx("ctp-date", tab === "date" && "ctp-active")}
              onClick={() => setTab("date")}
            >
              {labels.date}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "time"}
              className={cx("ctp-time", tab === "time" && "ctp-active")}
              onClick={() => setTab("time")}
            >
              {labels.time}
            </button>
          </div>
        </div>
      )}

      {showDatePanel && datePanel}
      {showTimePanel && timePanel}

      <div className="ctp-footer">
        <button type="button" className="close-button" onClick={clearAndClose}>
          {labels.clear}
        </button>
        {!inline && (
          <button type="button" className="ctp-cancel" onClick={close}>
            {labels.close}
          </button>
        )}
        <button type="button" onClick={confirm}>
          {labels.ok}
        </button>
      </div>
    </div>
  );

  if (inline) {
    return picker;
  }

  if (popover) {
    return createPortal(picker, document.body);
  }

  return createPortal(
    <div
      className="ctp-calendar-time-picker-absolute-container"
      data-ctp-theme={themeAttr}
      onClick={onBackdropClick}
    >
      {picker}
    </div>,
    document.body
  );
}

function padDisplay(n: number): string {
  return String(n).padStart(2, "0");
}

function TimeColumn(props: {
  label: string;
  open: boolean;
  onToggle: () => void;
  display: string;
  options: string[];
  onSelect: (value: string) => void;
}) {
  const listId = useId();
  return (
    <div
      className={cx("ctp-box", "ctp-box-time", !props.open && "not-opened")}
    >
      <button
        type="button"
        className={`ctp-${props.label === "am-pm" ? "am-pm" : props.label.slice(0, -1)} ctp-initial-time`}
        aria-haspopup="listbox"
        aria-expanded={props.open}
        aria-controls={listId}
        aria-label={`Select ${props.label}`}
        onClick={props.onToggle}
      >
        {props.display}
      </button>
      <div
        id={listId}
        role="listbox"
        aria-label={props.label}
        className={cx(
          `ctp-overflow-${props.label}`,
          !props.open && "not-visible"
        )}
      >
        {props.options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="option"
            aria-selected={opt === props.display}
            className={`ctp-${props.label === "am-pm" ? "am-pm" : props.label.slice(0, -1)}`}
            onClick={() => props.onSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DateTime;

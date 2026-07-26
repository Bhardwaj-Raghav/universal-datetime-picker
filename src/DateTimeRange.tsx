import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { CalendarHeader } from "./CalendarHeader";
import { buildCalendarMonth } from "./calendar";
import { useFocusTrap, useOnEscape } from "./hooks/useA11y";
import { useControllableState } from "./hooks/useControllableState";
import {
  DEFAULT_LABELS,
  type CalendarPanel,
  type DateTimeRangeProps,
} from "./types";
import {
  DATE_FORMAT,
  dayjs,
  endOfWeek,
  formatLocalized,
  formatValue,
  getWeekdayLabels,
  parseValue,
  startOfWeek,
  warnAsStringDeprecation,
  type Dayjs,
} from "./utils/date";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function DateTimeRange(props: DateTimeRangeProps) {
  const {
    value,
    defaultValue = null,
    onChange,
    asString,
    format = DATE_FORMAT,
    minDate,
    maxDate,
    disablePastDates = false,
    disableFutureDates = false,
    weekStartsOn = 0,
    locale = "en",
    labels: labelsProp,
    inline = false,
    className,
    style,
    open: openProp,
    defaultOpen = true,
    onOpenChange,
  } = props;

  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelsProp }),
    [labelsProp]
  );

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const parseRange = (
    range: { start: unknown; end: unknown } | null | undefined
  ): { start: Dayjs | null; end: Dayjs | null } => ({
    start: parseValue((range?.start as string) ?? null, format),
    end: parseValue((range?.end as string) ?? null, format),
  });

  const initial = parseRange(value ?? defaultValue);
  const [start, setStart] = useState<Dayjs | null>(initial.start);
  const [end, setEnd] = useState<Dayjs | null>(initial.end);
  const [hoverEnd, setHoverEnd] = useState<Dayjs | null>(null);
  const [viewMonth, setViewMonth] = useState<Dayjs>(
    (initial.start ?? dayjs()).startOf("month")
  );
  const [focusedDay, setFocusedDay] = useState<Dayjs>(
    initial.start ?? dayjs()
  );
  const [calPanel, setCalPanel] = useState<CalendarPanel>("day");

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: inline ? true : defaultOpen,
    onChange: onOpenChange,
  });

  useEffect(() => {
    if (value === null || value === undefined) {
      if (value === null) {
        setStart(null);
        setEnd(null);
        setHoverEnd(null);
      }
      return;
    }
    const parsed = parseRange(value);
    setStart(parsed.start);
    setEnd(parsed.end);
    setHoverEnd(null);
    if (parsed.start) {
      setViewMonth(parsed.start.startOf("month"));
      setFocusedDay(parsed.start);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, format]);

  const close = useCallback(() => {
    if (!inline) {
      setOpen(false);
    }
  }, [inline, setOpen]);

  const emit = useCallback(
    (nextStart: Dayjs | null, nextEnd: Dayjs | null) => {
      if (asString === false) {
        onChange?.({
          start: nextStart ? nextStart.toDate() : null,
          end: nextEnd ? nextEnd.toDate() : null,
        });
      } else {
        if (asString === undefined) {
          warnAsStringDeprecation();
        }
        onChange?.({
          start: formatValue(nextStart, format),
          end: formatValue(nextEnd, format),
        });
      }
    },
    [asString, format, onChange]
  );

  const confirm = useCallback(() => {
    emit(start, end);
    close();
  }, [close, emit, end, start]);

  const clear = useCallback(() => {
    setStart(null);
    setEnd(null);
    setHoverEnd(null);
    emit(null, null);
    close();
  }, [close, emit]);

  useOnEscape(close, open && !inline);
  useFocusTrap(dialogRef, open && !inline);

  const onDayClick = (day: Dayjs) => {
    if (!start || (start && end)) {
      setStart(day);
      setEnd(null);
      setHoverEnd(null);
      setFocusedDay(day);
      return;
    }
    if (day.isBefore(start, "day")) {
      setStart(day);
      setEnd(null);
      setHoverEnd(null);
      setFocusedDay(day);
      return;
    }
    setEnd(day);
    setHoverEnd(null);
    setFocusedDay(day);
  };

  const weeks = useMemo(
    () =>
      buildCalendarMonth({
        viewMonth,
        rangeStart: start,
        rangeEnd: end,
        hoverEnd: start && !end ? hoverEnd : null,
        minDate,
        maxDate,
        disablePastDates,
        disableFutureDates,
        weekStartsOn,
      }),
    [
      viewMonth,
      start,
      end,
      hoverEnd,
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
          onDayClick(cell.date);
        }
        return;
      }
      default:
        return;
    }
    event.preventDefault();
    setFocusedDay(next);
    if (start && !end) {
      setHoverEnd(next);
    }
    if (!next.isSame(viewMonth, "month")) {
      setViewMonth(next.startOf("month"));
    }
  };

  if (!open && !inline) {
    return null;
  }

  const statusText =
    start && !end
      ? labels.selectEnd
      : `${start ? formatLocalized(start, "MMM D, YYYY", locale) : labels.start} — ${
          end ? formatLocalized(end, "MMM D, YYYY", locale) : labels.end
        }`;

  const picker = (
    <div
      ref={dialogRef}
      className={cx("ctp-calendar-time-picker", className)}
      style={style}
      role={inline ? undefined : "dialog"}
      aria-modal={inline ? undefined : true}
      aria-labelledby={titleId}
    >
      <div className="ctp-header">
        <span id={titleId} className="ctp-range-title">
          {start ? formatLocalized(start, "MMM D, YYYY", locale) : labels.start}
          {" — "}
          {end ? formatLocalized(end, "MMM D, YYYY", locale) : labels.end}
        </span>
        <span className="ctp-visually-hidden" aria-live="polite">
          {statusText}
        </span>
      </div>
      <div className="ctp-body ctp-body-calendar-date">
        <CalendarHeader
          viewMonth={viewMonth}
          setViewMonth={setViewMonth}
          panel={calPanel}
          onPanelChange={setCalPanel}
          locale={locale}
          labels={labels}
        />
        {calPanel === "day" && (
          <div
            className="ctp-main-calendar"
            role="grid"
            aria-label={labels.chooseDateRange}
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
                const disabled = !dayData.isCurrentMonth || dayData.isDisabled;
                const focused = dayData.date.isSame(focusedDay, "day");
                return (
                  <button
                    key={dayData.date.format("YYYY-MM-DD")}
                    type="button"
                    role="gridcell"
                    tabIndex={focused ? 0 : -1}
                    aria-label={formatLocalized(
                      dayData.date,
                      "dddd, MMMM D, YYYY",
                      locale
                    )}
                    aria-selected={Boolean(
                      dayData.isRangeStart || dayData.isRangeEnd
                    )}
                    aria-disabled={disabled}
                    disabled={disabled}
                    className={cx(
                      "ctp-box",
                      "ctp-box-date",
                      !dayData.isCurrentMonth && "not-current-month",
                      dayData.isDisabled && "disabled-date",
                      dayData.isWeekend && "weekend-day",
                      dayData.isInRange && "ctp-in-range",
                      dayData.isRangeStart && "ctp-range-start",
                      dayData.isRangeEnd && "ctp-range-end",
                      dayData.isCurrentDate && "ctp-today",
                      (dayData.isRangeStart || dayData.isRangeEnd) && "selected"
                    )}
                    onMouseEnter={() => {
                      if (start && !end && !disabled) {
                        setHoverEnd(dayData.date);
                      }
                    }}
                    onMouseLeave={() => {
                      if (start && !end) {
                        setHoverEnd(null);
                      }
                    }}
                    onClick={() => {
                      if (!disabled) {
                        onDayClick(dayData.date);
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
      <div className="ctp-footer">
        <button type="button" className="close-button" onClick={clear}>
          {labels.clear}
        </button>
        {!inline && (
          <button type="button" className="ctp-cancel" onClick={close}>
            {labels.close}
          </button>
        )}
        <button type="button" onClick={confirm} disabled={!start || !end}>
          {labels.ok}
        </button>
      </div>
    </div>
  );

  if (inline) {
    return picker;
  }

  return createPortal(
    <div
      className="ctp-calendar-time-picker-absolute-container"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      {picker}
    </div>,
    document.body
  );
}

export default DateTimeRange;

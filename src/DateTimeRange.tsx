import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { CalendarHeader } from "./CalendarHeader";
import { RangeController } from "./core/rangeController";
import { attachEscape, attachFocusTrap } from "./vanilla/a11y";
import { useControllableState } from "./hooks/useControllableState";
import type { DateTimeRangeProps } from "./types";
import { formatLocalized } from "./utils/date";
import type { RangeSnapshot } from "./core/rangeController";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function DateTimeRange(props: DateTimeRangeProps) {
  const {
    value,
    defaultValue = null,
    onChange,
    asString,
    format,
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

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: inline ? true : defaultOpen,
    onChange: onOpenChange,
  });

  const controllerRef = useRef<RangeController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = new RangeController({
      value,
      defaultValue,
      onChange,
      asString,
      format,
      minDate,
      maxDate,
      disablePastDates,
      disableFutureDates,
      weekStartsOn,
      locale,
      labels: labelsProp,
      inline,
      className,
      open,
      onOpenChange: setOpen,
    });
  }
  const controller = controllerRef.current;

  useEffect(() => {
    controller.setOptions({
      value,
      onChange,
      asString,
      format,
      minDate,
      maxDate,
      disablePastDates,
      disableFutureDates,
      weekStartsOn,
      locale,
      labels: labelsProp,
      inline,
      className,
      open,
      onOpenChange: setOpen,
    });
  }, [
    controller,
    value,
    onChange,
    asString,
    format,
    minDate,
    maxDate,
    disablePastDates,
    disableFutureDates,
    weekStartsOn,
    locale,
    labelsProp,
    inline,
    className,
    open,
    setOpen,
  ]);

  const snap = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getServerSnapshot
  ) as RangeSnapshot;

  const close = () => {
    if (!inline) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!(open && !inline)) {
      return;
    }
    return attachEscape(close, true);
  }, [open, inline]);

  useEffect(() => {
    if (!(open && !inline) || !dialogRef.current) {
      return;
    }
    return attachFocusTrap(dialogRef.current, true);
  }, [open, inline]);

  const onGridKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (controller.handleGridKeyDown(event.key)) {
      event.preventDefault();
    }
  };

  if (!open && !inline) {
    return null;
  }

  const statusText =
    snap.start && !snap.end
      ? snap.labels.selectEnd
      : `${snap.start ? formatLocalized(snap.start, "MMM D, YYYY", snap.locale) : snap.labels.start} — ${
          snap.end
            ? formatLocalized(snap.end, "MMM D, YYYY", snap.locale)
            : snap.labels.end
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
          {statusText}
        </span>
      </div>
      <div className="ctp-body ctp-body-calendar-date">
        <CalendarHeader
          viewMonth={snap.viewMonth}
          setViewMonth={(next) => controller.setViewMonth(next)}
          panel={snap.calPanel}
          onPanelChange={(p) => controller.setCalPanel(p)}
          locale={snap.locale}
          labels={snap.labels}
        />
        {snap.calPanel === "day" && (
          <div
            className="ctp-main-calendar"
            role="grid"
            aria-label={snap.labels.chooseDateRange}
            tabIndex={0}
            onKeyDown={onGridKeyDown}
          >
            {snap.weekdayLabels.map((label) => (
              <div
                key={label}
                className="ctp-box ctp-box-days"
                role="columnheader"
              >
                {label}
              </div>
            ))}
            {snap.weeks.map((week) =>
              week.map((dayData) => {
                const focused = dayData.date.isSame(snap.focusedDay, "day");
                const disabled = !dayData.isCurrentMonth || dayData.isDisabled;
                return (
                  <button
                    key={dayData.date.format("YYYY-MM-DD")}
                    type="button"
                    role="gridcell"
                    tabIndex={focused ? 0 : -1}
                    aria-selected={Boolean(
                      dayData.isRangeStart || dayData.isRangeEnd
                    )}
                    aria-disabled={disabled}
                    disabled={disabled}
                    aria-label={formatLocalized(
                      dayData.date,
                      "dddd, MMMM D, YYYY",
                      snap.locale
                    )}
                    className={cx(
                      "ctp-box",
                      "ctp-box-date",
                      !dayData.isCurrentMonth && "not-current-month",
                      dayData.isDisabled && "disabled-date",
                      dayData.isWeekend && "weekend-day",
                      dayData.isCurrentDate && "ctp-today",
                      dayData.isInRange && "ctp-in-range",
                      dayData.isRangeStart && "ctp-range-start",
                      dayData.isRangeEnd && "ctp-range-end"
                    )}
                    onClick={() => {
                      if (!disabled) {
                        controller.pickDay(dayData.date);
                      }
                    }}
                    onMouseEnter={() => {
                      if (!disabled && snap.start && !snap.end) {
                        controller.setHoverEnd(dayData.date);
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
        <button
          type="button"
          className="close-button"
          onClick={() => {
            controller.clear();
            close();
          }}
        >
          {snap.labels.clear}
        </button>
        {!inline && (
          <button type="button" className="ctp-cancel" onClick={close}>
            {snap.labels.close}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            controller.confirm();
            close();
          }}
          disabled={!snap.start || !snap.end}
        >
          {snap.labels.ok}
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

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { CalendarHeader } from "./CalendarHeader";
import { PickerController } from "./core/controller";
import {
  attachClickOutside,
  attachEscape,
  attachFocusTrap,
  computePopoverPosition,
  DEFAULT_PICKER_HEIGHT,
  DEFAULT_PICKER_WIDTH,
  resolveThemeAttr,
} from "./vanilla/a11y";
import { useControllableState } from "./hooks/useControllableState";
import { useLatest } from "./hooks/useLatest";
import type { DateTimeProps } from "./types";
import { formatLocalized } from "./utils/date";
import type { PickerSnapshot } from "./core/controller";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function usePopoverPosition(
  anchorEl: HTMLElement | null | undefined,
  open: boolean,
  enabled: boolean,
  floatingRef: RefObject<HTMLElement | null>
): { top: number; left: number } | null {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const update = useCallback(() => {
    if (!enabled || !open || !anchorEl) {
      setPosition(null);
      return;
    }
    const floating = floatingRef.current;
    const width = floating?.offsetWidth || DEFAULT_PICKER_WIDTH;
    const height = floating?.offsetHeight || DEFAULT_PICKER_HEIGHT;
    setPosition(computePopoverPosition(anchorEl, width, height));
  }, [anchorEl, enabled, open, floatingRef]);

  useIsomorphicLayoutEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    if (!open || !enabled) {
      return;
    }
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const floating = floatingRef.current;
    let observer: ResizeObserver | undefined;
    if (floating && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => update());
      observer.observe(floating);
    }
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      observer?.disconnect();
    };
  }, [open, enabled, update, floatingRef]);

  if (!open || !enabled) {
    return null;
  }
  return position;
}

/**
 * React date / time / datetime picker.
 *
 * Renders inline, as a centered overlay, or as a `popover` beside `anchorEl`.
 * Non-inline pickers default to open unless `open` / `defaultOpen` is set.
 *
 * @see DateTimeProps
 */
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

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: inline ? true : defaultOpen,
    onChange: onOpenChange,
  });

  const controllerRef = useRef<PickerController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = new PickerController({
      value,
      defaultValue,
      onChange,
      asString,
      showSeconds,
      format,
      mode,
      layout,
      minDate,
      maxDate,
      disablePastDates,
      disableFutureDates,
      weekStartsOn,
      use12Hours,
      inline,
      className,
      locale,
      labels: labelsProp,
      theme,
      open,
      popover,
      anchorEl,
    });
  }
  const controller = controllerRef.current;

  const onChangeRef = useLatest(onChange);
  const setOpenRef = useLatest(setOpen);

  useEffect(() => {
    controller.setOptions({
      value,
      onChange: (next) => onChangeRef.current?.(next),
      asString,
      showSeconds,
      format,
      mode,
      layout,
      minDate,
      maxDate,
      disablePastDates,
      disableFutureDates,
      weekStartsOn,
      use12Hours,
      inline,
      className,
      locale,
      labels: labelsProp,
      theme,
      open,
      popover,
      anchorEl,
      onOpenChange: (next) => setOpenRef.current(next),
    });
  }, [
    controller,
    value,
    asString,
    showSeconds,
    format,
    mode,
    layout,
    minDate,
    maxDate,
    disablePastDates,
    disableFutureDates,
    weekStartsOn,
    use12Hours,
    inline,
    className,
    locale,
    labelsProp,
    theme,
    open,
    popover,
    anchorEl,
  ]);

  const snap = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getServerSnapshot
  ) as PickerSnapshot;

  const close = useCallback(() => {
    if (!inline) {
      setOpen(false);
    }
  }, [inline, setOpen]);

  useEffect(() => {
    if (!(open && !inline)) {
      return;
    }
    const el = dialogRef.current;
    if (!el) {
      return;
    }
    return attachEscape(close, true);
  }, [open, inline, close]);

  useEffect(() => {
    if (!(open && !inline)) {
      return;
    }
    const el = dialogRef.current;
    if (!el) {
      return;
    }
    return attachFocusTrap(el, true);
  }, [open, inline]);

  useEffect(() => {
    if (!(open && !inline && popover)) {
      return;
    }
    return attachClickOutside(close, true, dialogRef.current, anchorEl);
  }, [open, inline, popover, close, anchorEl]);

  const position = usePopoverPosition(
    anchorEl,
    open && !inline,
    popover,
    dialogRef
  );

  const onGridKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (controller.handleGridKeyDown(event.key)) {
      event.preventDefault();
    }
  };

  const onBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      close();
    }
  };

  if (!open && !inline) {
    return null;
  }

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
        viewMonth={snap.viewMonth}
        setViewMonth={(next) => controller.setViewMonth(next)}
        panel={snap.calPanel}
        onPanelChange={(p) => controller.setCalPanel(p)}
        locale={snap.locale}
        labels={snap.labels}
        titleId={snap.showDatePanel ? titleId : undefined}
        disableOptions={{
          minDate,
          maxDate,
          disablePastDates,
          disableFutureDates,
          weekStartsOn,
        }}
        onNavigatePrev={() => controller.navigatePrev()}
        onNavigateNext={() => controller.navigateNext()}
        onSelectMonth={(monthIndex) => controller.selectMonth(monthIndex)}
        onSelectYear={(year) => controller.selectYear(year)}
      />
      {snap.calPanel === "day" && (
        <div
          className="ctp-main-calendar"
          role="grid"
          aria-label={snap.labels.chooseDate}
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
              const selected = dayData.isSelected;
              const focused = dayData.date.isSame(snap.focusedDay, "day");
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
                    snap.locale
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
                      controller.selectDay(dayData.date);
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
      {snap.showDatePanel && (
        <div className="ctp-section-label">{snap.labels.time}</div>
      )}
      {!snap.showDatePanel && (
        <span className="ctp-visually-hidden" id={titleId}>
          {snap.labels.time}
        </span>
      )}
      <div className="ctp-main-time">
        <div className="ctp-main-time-header">
          <div className="ctp-box">Hr</div>
          <div className="ctp-box">Min</div>
          {snap.showSeconds && <div className="ctp-box">Sec</div>}
          {snap.use12Hours && <div className="ctp-box">AM/PM</div>}
        </div>
        <div className="ctp-main-time-body">
          <TimeColumn
            label="hours"
            open={snap.showHours}
            onToggle={() => controller.toggleHours()}
            display={snap.displayHour}
            options={snap.hourOptions}
            onSelect={(opt) => controller.selectHourOption(opt)}
          />
          <TimeColumn
            label="minutes"
            open={snap.showMinutes}
            onToggle={() => controller.toggleMinutes()}
            display={snap.displayMinute}
            options={snap.minuteOptions}
            onSelect={(opt) => controller.selectMinuteOption(opt)}
          />
          {snap.showSeconds && (
            <TimeColumn
              label="seconds"
              open={snap.showSecondsOpen}
              onToggle={() => controller.toggleSeconds()}
              display={snap.displaySecond}
              options={snap.minuteOptions}
              onSelect={(opt) => controller.selectSecondOption(opt)}
            />
          )}
          {snap.use12Hours && (
            <TimeColumn
              label="am-pm"
              open={snap.showAmPm}
              onToggle={() => controller.toggleAmPm()}
              display={snap.isAm ? "AM" : "PM"}
              options={["AM", "PM"]}
              onSelect={(opt) => controller.selectAmPmOption(opt)}
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
        snap.use12Hours && "ctp-use-12h",
        snap.mode === "time" && "ctp-mode-time",
        !snap.showSeconds && "ctp-no-seconds",
        snap.showDatePanel && snap.showTimePanel && "ctp-layout-combined",
        className
      )}
      style={pickerStyle}
      data-ctp-theme={themeAttr}
      role={inline ? undefined : "dialog"}
      aria-modal={inline ? undefined : true}
      aria-labelledby={titleId}
    >
      {snap.showModeTabs && (
        <div className="ctp-header">
          <div
            className="ctp-button-container"
            role="tablist"
            aria-label="Picker mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={snap.tab === "date"}
              className={cx("ctp-date", snap.tab === "date" && "ctp-active")}
              onClick={() => controller.setTab("date")}
            >
              {snap.labels.date}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={snap.tab === "time"}
              className={cx("ctp-time", snap.tab === "time" && "ctp-active")}
              onClick={() => controller.setTab("time")}
            >
              {snap.labels.time}
            </button>
          </div>
        </div>
      )}

      {snap.showDatePanel && datePanel}
      {snap.showTimePanel && timePanel}

      <div className="ctp-footer">
        <button
          type="button"
          className="close-button"
          onClick={() => {
            controller.clear();
          }}
        >
          {snap.labels.clear}
        </button>
        {!inline && (
          <button type="button" className="ctp-cancel" onClick={close}>
            {snap.labels.close}
          </button>
        )}
        {!inline && snap.mode !== "date" && (
          <button
            type="button"
            onClick={() => {
              controller.confirm();
            }}
          >
            {snap.labels.ok}
          </button>
        )}
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

function TimeColumn(props: {
  label: string;
  open: boolean;
  onToggle: () => void;
  display: string;
  options: string[];
  onSelect: (value: string) => void;
}) {
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (props.open && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [props.open]);

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
        ref={listRef}
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

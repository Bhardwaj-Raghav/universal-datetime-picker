import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { DayDisableOptions } from "./core/logic/calendar";
import {
  canNavigateNext,
  canNavigatePrev,
  isMonthSelectable,
  isYearSelectable,
  yearWindowStart,
} from "./core/logic/calendar";
import type { CalendarPanel, DateTimeLabels } from "./types";
import { dayjs, formatLocalized, type Dayjs } from "./utils/date";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface CalendarHeaderProps {
  viewMonth: Dayjs;
  setViewMonth: Dispatch<SetStateAction<Dayjs>>;
  panel: CalendarPanel;
  onPanelChange: (panel: CalendarPanel) => void;
  locale: string;
  labels: Required<DateTimeLabels>;
  titleId?: string;
  /** When set, month/year navigation stays within these bounds. */
  disableOptions?: DayDisableOptions;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onSelectMonth?: (monthIndex: number) => void;
  onSelectYear?: (year: number) => void;
}

export function CalendarHeader(props: CalendarHeaderProps) {
  const {
    viewMonth,
    setViewMonth,
    panel,
    onPanelChange,
    locale,
    labels,
    titleId,
    disableOptions = {},
    onNavigatePrev,
    onNavigateNext,
    onSelectMonth,
    onSelectYear,
  } = props;

  const year = viewMonth.year();
  const windowStart = yearWindowStart(year);
  const windowEnd = windowStart + 11;
  const now = dayjs();
  const canPrev = canNavigatePrev(viewMonth, panel, disableOptions);
  const canNext = canNavigateNext(viewMonth, panel, disableOptions);

  const onPrev = () => {
    if (!canPrev) {
      return;
    }
    if (onNavigatePrev) {
      onNavigatePrev();
      return;
    }
    if (panel === "day") {
      setViewMonth((m) => m.subtract(1, "month"));
      return;
    }
    if (panel === "month") {
      setViewMonth((m) => m.subtract(1, "year"));
      return;
    }
    setViewMonth((m) => m.subtract(12, "year"));
  };

  const onNext = () => {
    if (!canNext) {
      return;
    }
    if (onNavigateNext) {
      onNavigateNext();
      return;
    }
    if (panel === "day") {
      setViewMonth((m) => m.add(1, "month"));
      return;
    }
    if (panel === "month") {
      setViewMonth((m) => m.add(1, "year"));
      return;
    }
    setViewMonth((m) => m.add(12, "year"));
  };

  const prevLabel =
    panel === "day" ? labels.previousMonth : labels.previousYear;
  const nextLabel = panel === "day" ? labels.nextMonth : labels.nextYear;

  let titleContent: ReactNode;
  if (panel === "day") {
    titleContent = (
      <button
        type="button"
        className="ctp-current-month"
        id={titleId}
        aria-label={`${formatLocalized(viewMonth, "MMMM YYYY", locale)}. ${labels.chooseMonth}`}
        onClick={() => onPanelChange("month")}
      >
        {formatLocalized(viewMonth, "MMMM YYYY", locale)}
      </button>
    );
  } else if (panel === "month") {
    titleContent = (
      <button
        type="button"
        className="ctp-current-month"
        id={titleId}
        aria-label={`${year}. ${labels.chooseYear}`}
        onClick={() => onPanelChange("year")}
      >
        {String(year)}
      </button>
    );
  } else {
    titleContent = (
      <span className="ctp-current-month" id={titleId}>
        {windowStart} – {windowEnd}
      </span>
    );
  }

  return (
    <>
      <div className="ctp-month-year">
        <button
          type="button"
          className="ctp-prev-month"
          aria-label={prevLabel}
          disabled={!canPrev}
          onClick={onPrev}
        >
          ‹
        </button>
        {titleContent}
        <button
          type="button"
          className="ctp-next-month"
          aria-label={nextLabel}
          disabled={!canNext}
          onClick={onNext}
        >
          ›
        </button>
      </div>

      {panel === "month" && (
        <div
          className="ctp-month-grid"
          role="grid"
          aria-label={labels.chooseMonth}
        >
          {Array.from({ length: 12 }, (_, monthIndex) => {
            const monthDate = viewMonth.month(monthIndex);
            const isCurrent =
              viewMonth.year() === now.year() && monthIndex === now.month();
            const disabled = !isMonthSelectable(monthDate, disableOptions);
            return (
              <button
                key={monthIndex}
                type="button"
                role="gridcell"
                disabled={disabled}
                aria-disabled={disabled}
                aria-current={isCurrent ? "date" : undefined}
                aria-label={formatLocalized(monthDate, "MMMM YYYY", locale)}
                className={cx(
                  "ctp-box",
                  "ctp-box-month",
                  isCurrent && "ctp-current",
                  disabled && "disabled-date"
                )}
                onClick={() => {
                  if (disabled) {
                    return;
                  }
                  if (onSelectMonth) {
                    onSelectMonth(monthIndex);
                    return;
                  }
                  setViewMonth((m) => m.month(monthIndex));
                  onPanelChange("day");
                }}
              >
                {formatLocalized(monthDate, "MMM", locale)}
              </button>
            );
          })}
        </div>
      )}

      {panel === "year" && (
        <div
          className="ctp-year-grid"
          role="grid"
          aria-label={labels.chooseYear}
        >
          {Array.from({ length: 12 }, (_, offset) => {
            const y = windowStart + offset;
            const isCurrent = now.year() === y;
            const disabled = !isYearSelectable(y, disableOptions);
            return (
              <button
                key={y}
                type="button"
                role="gridcell"
                disabled={disabled}
                aria-disabled={disabled}
                aria-current={isCurrent ? "date" : undefined}
                aria-label={String(y)}
                className={cx(
                  "ctp-box",
                  "ctp-box-year",
                  isCurrent && "ctp-current",
                  disabled && "disabled-date"
                )}
                onClick={() => {
                  if (disabled) {
                    return;
                  }
                  if (onSelectYear) {
                    onSelectYear(y);
                    return;
                  }
                  setViewMonth((m) => m.year(y));
                  onPanelChange("month");
                }}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

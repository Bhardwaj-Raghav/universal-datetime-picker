import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { CalendarPanel, DateTimeLabels } from "./types";
import { dayjs, formatLocalized, type Dayjs } from "./utils/date";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function yearWindowStart(year: number): number {
  return Math.floor(year / 12) * 12;
}

export interface CalendarHeaderProps {
  viewMonth: Dayjs;
  setViewMonth: Dispatch<SetStateAction<Dayjs>>;
  panel: CalendarPanel;
  onPanelChange: (panel: CalendarPanel) => void;
  locale: string;
  labels: Required<DateTimeLabels>;
  titleId?: string;
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
  } = props;

  const year = viewMonth.year();
  const windowStart = yearWindowStart(year);
  const windowEnd = windowStart + 11;
  const now = dayjs();

  const onPrev = () => {
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
          onClick={onPrev}
        >
          ‹
        </button>
        {titleContent}
        <button
          type="button"
          className="ctp-next-month"
          aria-label={nextLabel}
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
            return (
              <button
                key={monthIndex}
                type="button"
                role="gridcell"
                aria-current={isCurrent ? "date" : undefined}
                aria-label={formatLocalized(monthDate, "MMMM YYYY", locale)}
                className={cx(
                  "ctp-box",
                  "ctp-box-month",
                  isCurrent && "ctp-current"
                )}
                onClick={() => {
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
            return (
              <button
                key={y}
                type="button"
                role="gridcell"
                aria-current={isCurrent ? "date" : undefined}
                aria-label={String(y)}
                className={cx(
                  "ctp-box",
                  "ctp-box-year",
                  isCurrent && "ctp-current"
                )}
                onClick={() => {
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

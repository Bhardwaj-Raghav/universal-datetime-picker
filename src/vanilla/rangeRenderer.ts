import {
  RangeController,
  type RangeSnapshot,
} from "../core/rangeController";
import type { CalendarDay, DateTimeRangeOptions } from "../core/types";
import { formatLocalized } from "../core/logic/date";
import { dayjs, type Dayjs } from "../core/logic/date";
import {
  attachEscape,
  attachFocusTrap,
  cx,
  type Cleanup,
} from "./a11y";

export interface DateTimeRangePickerHandle {
  update: (options: Partial<DateTimeRangeOptions>) => void;
  destroy: () => void;
  getController: () => RangeController;
}

function el(
  tag: string,
  props: Record<string, unknown> = {},
  children: Array<Node | string | null | undefined> = []
): HTMLElement {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) {
      continue;
    }
    if (key === "className") {
      node.className = String(value);
    } else if (key === "textContent") {
      node.textContent = String(value);
    } else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(
        key.slice(2).toLowerCase(),
        value as EventListener
      );
    } else if (key === "disabled") {
      (node as HTMLButtonElement).disabled = Boolean(value);
    } else if (key === "tabIndex") {
      node.tabIndex = Number(value);
    } else {
      const attr =
        key === "ariaLabel"
          ? "aria-label"
          : key === "ariaSelected"
            ? "aria-selected"
            : key === "ariaDisabled"
              ? "aria-disabled"
              : key === "ariaModal"
                ? "aria-modal"
                : key === "ariaLabelledby"
                  ? "aria-labelledby"
                  : key === "ariaCurrent"
                    ? "aria-current"
                    : key;
      node.setAttribute(attr, String(value));
    }
  }
  for (const child of children) {
    if (child == null) {
      continue;
    }
    node.append(typeof child === "string" ? child : child);
  }
  return node;
}

function applyStyle(
  node: HTMLElement,
  style: DateTimeRangeOptions["style"]
): void {
  if (!style) {
    return;
  }
  if (typeof style === "string") {
    node.setAttribute("style", style);
    return;
  }
  Object.assign(node.style, style);
}

function sameDay(a: Dayjs | null, b: Dayjs | null): boolean {
  if (a === null && b === null) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  return a.isSame(b, "day");
}

function dayDateClassName(dayData: CalendarDay): string {
  return cx(
    "ctp-box",
    "ctp-box-date",
    !dayData.isCurrentMonth && "not-current-month",
    dayData.isDisabled && "disabled-date",
    dayData.isWeekend && "weekend-day",
    dayData.isCurrentDate && "ctp-today",
    dayData.isInRange && "ctp-in-range",
    dayData.isRangeStart && "ctp-range-start",
    dayData.isRangeEnd && "ctp-range-end"
  );
}

function syncDayButton(
  btn: HTMLButtonElement,
  dayData: CalendarDay,
  snap: RangeSnapshot
): void {
  const focused = dayData.date.isSame(snap.focusedDay, "day");
  const disabled = !dayData.isCurrentMonth || dayData.isDisabled;
  btn.className = dayDateClassName(dayData);
  btn.tabIndex = focused ? 0 : -1;
  btn.disabled = disabled;
  btn.setAttribute(
    "aria-selected",
    String(Boolean(dayData.isRangeStart || dayData.isRangeEnd))
  );
  btn.setAttribute("aria-disabled", String(disabled));
}

function canPatchHoverOnly(prev: RangeSnapshot, next: RangeSnapshot): boolean {
  return (
    prev.calPanel === "day" &&
    next.calPanel === "day" &&
    prev.viewMonth.isSame(next.viewMonth, "month") &&
    sameDay(prev.start, next.start) &&
    sameDay(prev.end, next.end) &&
    prev.focusedDay.isSame(next.focusedDay, "day") &&
    prev.open === next.open &&
    prev.inline === next.inline
  );
}

export function createDateTimeRangePicker(
  target: HTMLElement,
  options: DateTimeRangeOptions = {}
): DateTimeRangePickerHandle {
  const controller = new RangeController(options);
  const titleId = `ctp-range-${Math.random().toString(36).slice(2, 9)}`;
  let cleanups: Cleanup[] = [];
  let host: HTMLElement | null = null;
  let portalRoot: HTMLElement | null = null;
  let lastSnap: RangeSnapshot | null = null;
  let dayButtons: Map<string, HTMLButtonElement> | null = null;

  const teardown = () => {
    cleanups.forEach((c) => c());
    cleanups = [];
    portalRoot?.remove();
    portalRoot = null;
    host?.remove();
    host = null;
    lastSnap = null;
    dayButtons = null;
  };

  const paint = () => {
    const snap = controller.getSnapshot();
    if (!snap.open && !snap.inline) {
      teardown();
      return;
    }

    if (
      lastSnap &&
      dayButtons &&
      host &&
      canPatchHoverOnly(lastSnap, snap)
    ) {
      for (const week of snap.weeks) {
        for (const dayData of week) {
          const key = dayData.date.format("YYYY-MM-DD");
          const btn = dayButtons.get(key);
          if (btn) {
            syncDayButton(btn, dayData, snap);
          }
        }
      }
      lastSnap = snap;
      return;
    }

    teardown();

    const now = dayjs();
    const year = snap.viewMonth.year();
    const windowStart = Math.floor(year / 12) * 12;
    const windowEnd = windowStart + 11;

    const statusText =
      snap.start && !snap.end
        ? snap.labels.selectEnd
        : `${snap.start ? formatLocalized(snap.start, "MMM D, YYYY", snap.locale) : snap.labels.start} — ${
            snap.end
              ? formatLocalized(snap.end, "MMM D, YYYY", snap.locale)
              : snap.labels.end
          }`;

    let title: HTMLElement;
    if (snap.calPanel === "day") {
      title = el("button", {
        type: "button",
        className: "ctp-current-month",
        ariaLabel: `${formatLocalized(snap.viewMonth, "MMMM YYYY", snap.locale)}. ${snap.labels.chooseMonth}`,
        onClick: () => controller.setCalPanel("month"),
        textContent: formatLocalized(snap.viewMonth, "MMMM YYYY", snap.locale),
      });
    } else if (snap.calPanel === "month") {
      title = el("button", {
        type: "button",
        className: "ctp-current-month",
        ariaLabel: `${year}. ${snap.labels.chooseYear}`,
        onClick: () => controller.setCalPanel("year"),
        textContent: String(year),
      });
    } else {
      title = el("span", {
        className: "ctp-current-month",
        textContent: `${windowStart} – ${windowEnd}`,
      });
    }

    const body = el("div", { className: "ctp-body ctp-body-calendar-date" }, [
      el("div", { className: "ctp-month-year" }, [
        el("button", {
          type: "button",
          className: "ctp-prev-month",
          ariaLabel:
            snap.calPanel === "day"
              ? snap.labels.previousMonth
              : snap.labels.previousYear,
          onClick: () => controller.navigatePrev(),
          textContent: "‹",
        }),
        title,
        el("button", {
          type: "button",
          className: "ctp-next-month",
          ariaLabel:
            snap.calPanel === "day"
              ? snap.labels.nextMonth
              : snap.labels.nextYear,
          onClick: () => controller.navigateNext(),
          textContent: "›",
        }),
      ]),
    ]);

    if (snap.calPanel === "day") {
      const buttons = new Map<string, HTMLButtonElement>();
      const grid = el("div", {
        className: "ctp-main-calendar",
        role: "grid",
        ariaLabel: snap.labels.chooseDateRange,
        tabIndex: 0,
        onKeydown: (event: Event) => {
          const ke = event as KeyboardEvent;
          if (controller.handleGridKeyDown(ke.key)) {
            ke.preventDefault();
          }
        },
        onMouseleave: () => controller.setHoverEnd(null),
      });
      for (const label of snap.weekdayLabels) {
        grid.append(
          el("div", {
            className: "ctp-box ctp-box-days",
            role: "columnheader",
            textContent: label,
          })
        );
      }
      for (const week of snap.weeks) {
        for (const dayData of week) {
          const focused = dayData.date.isSame(snap.focusedDay, "day");
          const disabled = !dayData.isCurrentMonth || dayData.isDisabled;
          const btn = el("button", {
            type: "button",
            role: "gridcell",
            tabIndex: focused ? 0 : -1,
            ariaSelected: Boolean(
              dayData.isRangeStart || dayData.isRangeEnd
            ),
            ariaDisabled: disabled,
            disabled,
            ariaLabel: formatLocalized(
              dayData.date,
              "dddd, MMMM D, YYYY",
              snap.locale
            ),
            className: dayDateClassName(dayData),
            onClick: () => {
              if (!disabled) {
                controller.pickDay(dayData.date);
              }
            },
            onMouseenter: () => {
              if (!disabled && snap.start && !snap.end) {
                controller.setHoverEnd(dayData.date);
              }
            },
            textContent: dayData.date.format("D"),
          }) as HTMLButtonElement;
          buttons.set(dayData.date.format("YYYY-MM-DD"), btn);
          grid.append(btn);
        }
      }
      dayButtons = buttons;
      body.append(grid);
    } else if (snap.calPanel === "month") {
      const grid = el("div", {
        className: "ctp-month-grid",
        role: "grid",
        ariaLabel: snap.labels.chooseMonth,
      });
      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        const monthDate = snap.viewMonth.month(monthIndex);
        const isCurrent =
          snap.viewMonth.year() === now.year() && monthIndex === now.month();
        grid.append(
          el("button", {
            type: "button",
            role: "gridcell",
            ariaCurrent: isCurrent ? "date" : undefined,
            className: cx(
              "ctp-box",
              "ctp-box-month",
              isCurrent && "ctp-current"
            ),
            onClick: () => controller.selectMonth(monthIndex),
            textContent: formatLocalized(monthDate, "MMM", snap.locale),
          })
        );
      }
      body.append(grid);
    } else {
      const grid = el("div", {
        className: "ctp-year-grid",
        role: "grid",
        ariaLabel: snap.labels.chooseYear,
      });
      for (let offset = 0; offset < 12; offset += 1) {
        const y = windowStart + offset;
        grid.append(
          el("button", {
            type: "button",
            role: "gridcell",
            ariaCurrent: now.year() === y ? "date" : undefined,
            className: cx(
              "ctp-box",
              "ctp-box-year",
              now.year() === y && "ctp-current"
            ),
            onClick: () => controller.selectYear(y),
            textContent: String(y),
          })
        );
      }
      body.append(grid);
    }

    const footerChildren: HTMLElement[] = [
      el("button", {
        type: "button",
        className: "close-button",
        onClick: () => controller.clear(),
        textContent: snap.labels.clear,
      }),
    ];
    if (!snap.inline) {
      footerChildren.push(
        el("button", {
          type: "button",
          className: "ctp-cancel",
          onClick: () => controller.close(),
          textContent: snap.labels.close,
        })
      );
    }
    if (!snap.inline) {
      footerChildren.push(
        el("button", {
          type: "button",
          disabled: !snap.start || !snap.end,
          onClick: () => controller.confirm(),
          textContent: snap.labels.ok,
        })
      );
    }

    const picker = el(
      "div",
      {
        className: cx("ctp-calendar-time-picker", snap.className),
        role: snap.inline ? undefined : "dialog",
        ariaModal: snap.inline ? undefined : true,
        ariaLabelledby: titleId,
      },
      [
        el("div", { className: "ctp-header" }, [
          el("span", {
            id: titleId,
            className: "ctp-range-title",
            textContent: statusText,
          }),
        ]),
        body,
        el("div", { className: "ctp-footer" }, footerChildren),
      ]
    );
    applyStyle(picker, options.style);

    if (snap.inline) {
      host = picker;
      target.append(picker);
      lastSnap = snap;
      return;
    }

    const backdrop = el("div", {
      className: "ctp-calendar-time-picker-absolute-container",
      onClick: (event: Event) => {
        if (event.target === event.currentTarget) {
          controller.close();
        }
      },
    });
    backdrop.append(picker);
    portalRoot = backdrop;
    document.body.append(backdrop);
    cleanups.push(
      attachFocusTrap(picker, true),
      attachEscape(() => controller.close(), true)
    );
    lastSnap = snap;
  };

  const unsub = controller.subscribe(paint);
  paint();

  return {
    update(partial) {
      Object.assign(options, partial);
      controller.setOptions(partial);
    },
    destroy() {
      unsub();
      teardown();
    },
    getController: () => controller,
  };
}

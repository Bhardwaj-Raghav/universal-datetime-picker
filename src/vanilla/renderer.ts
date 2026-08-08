import {
  PickerController,
  type PickerControllerOptions,
  type PickerSnapshot,
} from "../core/controller";
import {
  isMonthSelectable,
  isYearSelectable,
} from "../core/logic/calendar";
import { dayjs, formatLocalized } from "../core/logic/date";
import {
  attachClickOutside,
  attachEscape,
  attachFocusTrap,
  attachPopoverPosition,
  cx,
  resolveThemeAttr,
  type Cleanup,
} from "./a11y";

export interface DateTimePickerHandle {
  update: (options: Partial<PickerControllerOptions>) => void;
  destroy: () => void;
  getController: () => PickerController;
}

function applyStyle(
  el: HTMLElement,
  style: PickerControllerOptions["style"]
): void {
  if (!style) {
    return;
  }
  if (typeof style === "string") {
    el.setAttribute("style", style);
    return;
  }
  Object.assign(el.style, style);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, unknown> = {},
  children: Array<Node | string | null | undefined> = []
): HTMLElementTagNameMap[K] {
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
      const event = key.slice(2).toLowerCase();
      node.addEventListener(event, value as EventListener);
    } else if (key === "disabled") {
      (node as HTMLButtonElement).disabled = Boolean(value);
    } else if (key === "tabIndex") {
      node.tabIndex = Number(value);
    } else {
      node.setAttribute(
        key === "ariaLabel"
          ? "aria-label"
          : key === "ariaSelected"
            ? "aria-selected"
            : key === "ariaDisabled"
              ? "aria-disabled"
              : key === "ariaExpanded"
                ? "aria-expanded"
                : key === "ariaControls"
                  ? "aria-controls"
                  : key === "ariaHaspopup"
                    ? "aria-haspopup"
                    : key === "ariaModal"
                      ? "aria-modal"
                      : key === "ariaLabelledby"
                        ? "aria-labelledby"
                        : key === "ariaCurrent"
                          ? "aria-current"
                          : key,
        String(value)
      );
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

function renderHeader(
  controller: PickerController,
  snap: PickerSnapshot,
  titleId: string
): HTMLElement {
  const year = snap.viewMonth.year();
  const windowStart = controller.yearWindowStart(year);
  const windowEnd = windowStart + 11;
  const now = dayjs();
  const prevLabel =
    snap.calPanel === "day"
      ? snap.labels.previousMonth
      : snap.labels.previousYear;
  const nextLabel =
    snap.calPanel === "day" ? snap.labels.nextMonth : snap.labels.nextYear;

  let title: HTMLElement;
  if (snap.calPanel === "day") {
    title = el(
      "button",
      {
        type: "button",
        className: "ctp-current-month",
        id: titleId,
        ariaLabel: `${formatLocalized(snap.viewMonth, "MMMM YYYY", snap.locale)}. ${snap.labels.chooseMonth}`,
        onClick: () => controller.setCalPanel("month"),
        textContent: formatLocalized(snap.viewMonth, "MMMM YYYY", snap.locale),
      }
    );
  } else if (snap.calPanel === "month") {
    title = el(
      "button",
      {
        type: "button",
        className: "ctp-current-month",
        id: titleId,
        ariaLabel: `${year}. ${snap.labels.chooseYear}`,
        onClick: () => controller.setCalPanel("year"),
        textContent: String(year),
      }
    );
  } else {
    title = el("span", {
      className: "ctp-current-month",
      id: titleId,
      textContent: `${windowStart} – ${windowEnd}`,
    });
  }

  const fragment = el("div", { className: "ctp-body ctp-body-calendar-date" }, [
    el("div", { className: "ctp-month-year" }, [
      el("button", {
        type: "button",
        className: "ctp-prev-month",
        ariaLabel: prevLabel,
        disabled: !snap.canNavigatePrev,
        onClick: () => controller.navigatePrev(),
        textContent: "‹",
      }),
      title,
      el("button", {
        type: "button",
        className: "ctp-next-month",
        ariaLabel: nextLabel,
        disabled: !snap.canNavigateNext,
        onClick: () => controller.navigateNext(),
        textContent: "›",
      }),
    ]),
  ]);

  if (snap.calPanel === "month") {
    const grid = el("div", {
      className: "ctp-month-grid",
      role: "grid",
      ariaLabel: snap.labels.chooseMonth,
    });
    const disableOptions = controller.getDisableOptions();
    for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
      const monthDate = snap.viewMonth.month(monthIndex);
      const isCurrent =
        snap.viewMonth.year() === now.year() && monthIndex === now.month();
      const disabled = !isMonthSelectable(monthDate, disableOptions);
      grid.append(
        el("button", {
          type: "button",
          role: "gridcell",
          disabled,
          ariaDisabled: disabled,
          ariaCurrent: isCurrent ? "date" : undefined,
          ariaLabel: formatLocalized(monthDate, "MMMM YYYY", snap.locale),
          className: cx(
            "ctp-box",
            "ctp-box-month",
            isCurrent && "ctp-current",
            disabled && "disabled-date"
          ),
          onClick: () => controller.selectMonth(monthIndex),
          textContent: formatLocalized(monthDate, "MMM", snap.locale),
        })
      );
    }
    fragment.append(grid);
  } else if (snap.calPanel === "year") {
    const grid = el("div", {
      className: "ctp-year-grid",
      role: "grid",
      ariaLabel: snap.labels.chooseYear,
    });
    const disableOptions = controller.getDisableOptions();
    for (let offset = 0; offset < 12; offset += 1) {
      const y = windowStart + offset;
      const isCurrent = now.year() === y;
      const disabled = !isYearSelectable(y, disableOptions);
      grid.append(
        el("button", {
          type: "button",
          role: "gridcell",
          disabled,
          ariaDisabled: disabled,
          ariaCurrent: isCurrent ? "date" : undefined,
          ariaLabel: String(y),
          className: cx(
            "ctp-box",
            "ctp-box-year",
            isCurrent && "ctp-current",
            disabled && "disabled-date"
          ),
          onClick: () => controller.selectYear(y),
          textContent: String(y),
        })
      );
    }
    fragment.append(grid);
  } else {
    const grid = el("div", {
      className: "ctp-main-calendar",
      role: "grid",
      ariaLabel: snap.labels.chooseDate,
      tabIndex: 0,
      onKeydown: (event: Event) => {
        const ke = event as KeyboardEvent;
        if (controller.handleGridKeyDown(ke.key)) {
          ke.preventDefault();
        }
      },
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
        const selected = dayData.isSelected;
        const focused = dayData.date.isSame(snap.focusedDay, "day");
        const disabled = !dayData.isCurrentMonth || dayData.isDisabled;
        grid.append(
          el("button", {
            type: "button",
            role: "gridcell",
            tabIndex: focused ? 0 : -1,
            ariaSelected: selected,
            ariaDisabled: disabled,
            disabled,
            ariaLabel: formatLocalized(
              dayData.date,
              "dddd, MMMM D, YYYY",
              snap.locale
            ),
            className: cx(
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
            ),
            onClick: () => {
              if (!disabled) {
                controller.selectDay(dayData.date);
              }
            },
            textContent: dayData.date.format("D"),
          })
        );
      }
    }
    fragment.append(grid);
  }

  return fragment;
}

function renderTimeColumn(
  label: string,
  open: boolean,
  display: string,
  options: string[],
  onToggle: () => void,
  onSelect: (opt: string) => void
): HTMLElement {
  const listId = `ctp-${label}-${Math.random().toString(36).slice(2, 8)}`;
  const cls =
    label === "am-pm" ? "am-pm" : label.endsWith("s") ? label.slice(0, -1) : label;
  const list = el(
    "div",
    {
      id: listId,
      role: "listbox",
      ariaLabel: label,
      className: cx(`ctp-overflow-${label}`, !open && "not-visible"),
    },
    options.map((opt) =>
      el("button", {
        type: "button",
        role: "option",
        ariaSelected: opt === display,
        className: `ctp-${cls}`,
        onClick: () => onSelect(opt),
        textContent: opt,
      })
    )
  );

  return el(
    "div",
    { className: cx("ctp-box", "ctp-box-time", !open && "not-opened") },
    [
      el("button", {
        type: "button",
        className: `ctp-${cls} ctp-initial-time`,
        ariaHaspopup: "listbox",
        ariaExpanded: open,
        ariaControls: listId,
        ariaLabel: `Select ${label}`,
        onClick: onToggle,
        textContent: display,
      }),
      list,
    ]
  );
}

function renderTimePanel(
  controller: PickerController,
  snap: PickerSnapshot,
  titleId: string
): HTMLElement {
  const body = el("div", { className: "ctp-body ctp-body-calendar-time" });
  if (snap.showDatePanel) {
    body.append(
      el("div", { className: "ctp-section-label", textContent: snap.labels.time })
    );
  } else {
    body.append(
      el("span", {
        className: "ctp-visually-hidden",
        id: titleId,
        textContent: snap.labels.time,
      })
    );
  }

  const header = el("div", { className: "ctp-main-time-header" }, [
    el("div", { className: "ctp-box", textContent: "Hr" }),
    el("div", { className: "ctp-box", textContent: "Min" }),
    snap.showSeconds
      ? el("div", { className: "ctp-box", textContent: "Sec" })
      : null,
    snap.use12Hours
      ? el("div", { className: "ctp-box", textContent: "AM/PM" })
      : null,
  ]);

  const timeBody = el("div", { className: "ctp-main-time-body" }, [
    renderTimeColumn(
      "hours",
      snap.showHours,
      snap.displayHour,
      snap.hourOptions,
      () => controller.toggleHours(),
      (opt) => controller.selectHourOption(opt)
    ),
    renderTimeColumn(
      "minutes",
      snap.showMinutes,
      snap.displayMinute,
      snap.minuteOptions,
      () => controller.toggleMinutes(),
      (opt) => controller.selectMinuteOption(opt)
    ),
    snap.showSeconds
      ? renderTimeColumn(
          "seconds",
          snap.showSecondsOpen,
          snap.displaySecond,
          snap.minuteOptions,
          () => controller.toggleSeconds(),
          (opt) => controller.selectSecondOption(opt)
        )
      : null,
    snap.use12Hours
      ? renderTimeColumn(
          "am-pm",
          snap.showAmPm,
          snap.isAm ? "AM" : "PM",
          ["AM", "PM"],
          () => controller.toggleAmPm(),
          (opt) => controller.selectAmPmOption(opt)
        )
      : null,
  ]);

  body.append(
    el("div", { className: "ctp-main-time" }, [header, timeBody])
  );
  return body;
}

function pickerClassName(snap: PickerSnapshot, entering: boolean): string {
  return cx(
    "ctp-calendar-time-picker",
    entering && "ctp-entering",
    snap.popover && !snap.inline && "ctp-popover",
    snap.use12Hours && "ctp-use-12h",
    snap.mode === "time" && "ctp-mode-time",
    !snap.showSeconds && "ctp-no-seconds",
    snap.showDatePanel && snap.showTimePanel && "ctp-layout-combined",
    snap.className
  );
}

function syncPickerShell(
  picker: HTMLElement,
  snap: PickerSnapshot,
  titleId: string,
  position: { top: number; left: number } | null,
  options: PickerControllerOptions,
  entering: boolean
): void {
  picker.className = pickerClassName(snap, entering);
  if (snap.inline) {
    picker.removeAttribute("role");
    picker.removeAttribute("aria-modal");
  } else {
    picker.setAttribute("role", "dialog");
    picker.setAttribute("aria-modal", "true");
  }
  picker.setAttribute("aria-labelledby", titleId);

  const themeAttr = resolveThemeAttr(options.theme, options.anchorEl);
  if (themeAttr) {
    picker.setAttribute("data-ctp-theme", themeAttr);
  } else {
    picker.removeAttribute("data-ctp-theme");
  }

  applyStyle(picker, options.style);
  if (snap.popover && !snap.inline && position) {
    picker.style.position = "fixed";
    picker.style.top = `${position.top}px`;
    picker.style.left = `${position.left}px`;
  }
}

function fillPickerContent(
  picker: HTMLElement,
  controller: PickerController,
  snap: PickerSnapshot,
  titleId: string
): void {
  const children: HTMLElement[] = [];

  if (snap.showModeTabs) {
    children.push(
      el("div", { className: "ctp-header" }, [
        el(
          "div",
          {
            className: "ctp-button-container",
            role: "tablist",
            ariaLabel: "Picker mode",
          },
          [
            el("button", {
              type: "button",
              role: "tab",
              ariaSelected: snap.tab === "date",
              className: cx("ctp-date", snap.tab === "date" && "ctp-active"),
              onClick: () => controller.setTab("date"),
              textContent: snap.labels.date,
            }),
            el("button", {
              type: "button",
              role: "tab",
              ariaSelected: snap.tab === "time",
              className: cx("ctp-time", snap.tab === "time" && "ctp-active"),
              onClick: () => controller.setTab("time"),
              textContent: snap.labels.time,
            }),
          ]
        ),
      ])
    );
  }

  if (snap.showDatePanel) {
    children.push(renderHeader(controller, snap, titleId));
  }
  if (snap.showTimePanel) {
    children.push(renderTimePanel(controller, snap, titleId));
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
  if (!snap.inline && snap.mode !== "date") {
    footerChildren.push(
      el("button", {
        type: "button",
        onClick: () => controller.confirm(),
        textContent: snap.labels.ok,
      })
    );
  }
  children.push(el("div", { className: "ctp-footer" }, footerChildren));
  picker.replaceChildren(...children);
}

function renderPicker(
  controller: PickerController,
  snap: PickerSnapshot,
  titleId: string,
  position: { top: number; left: number } | null,
  options: PickerControllerOptions,
  entering = false
): HTMLElement {
  const picker = document.createElement("div");
  syncPickerShell(picker, snap, titleId, position, options, entering);
  fillPickerContent(picker, controller, snap, titleId);
  return picker;
}

/** Update an existing picker root in place (keeps element identity). */
function updatePickerInPlace(
  picker: HTMLElement,
  controller: PickerController,
  snap: PickerSnapshot,
  titleId: string,
  position: { top: number; left: number } | null,
  options: PickerControllerOptions
): void {
  syncPickerShell(picker, snap, titleId, position, options, false);
  fillPickerContent(picker, controller, snap, titleId);
}

/**
 * Mount a date/time picker into `target` (or as overlay/popover).
 * Returns `{ update, destroy }` for imperative control.
 */
export function createDateTimePicker(
  target: HTMLElement,
  options: PickerControllerOptions = {}
): DateTimePickerHandle {
  const controller = new PickerController(options);
  const titleId = `ctp-title-${Math.random().toString(36).slice(2, 9)}`;
  let cleanups: Cleanup[] = [];
  let position: { top: number; left: number } | null = null;
  let host: HTMLElement | null = null;
  let portalRoot: HTMLElement | null = null;
  let shellMode: "inline" | "popover" | "overlay" | null = null;

  const teardown = () => {
    cleanups.forEach((c) => c());
    cleanups = [];
    portalRoot?.remove();
    portalRoot = null;
    if (host && host.parentElement === target) {
      host.remove();
    }
    host = null;
    shellMode = null;
  };

  const paint = () => {
    const snap = controller.getSnapshot();
    if (!snap.open && !snap.inline) {
      teardown();
      return;
    }

    const opts = { ...options };
    const nextMode: "inline" | "popover" | "overlay" = snap.inline
      ? "inline"
      : snap.popover
        ? "popover"
        : "overlay";

    // Reuse the open picker root so month/year navigation does not remount.
    if (host && shellMode === nextMode) {
      updatePickerInPlace(host, controller, snap, titleId, position, opts);
      return;
    }

    teardown();

    const picker = renderPicker(
      controller,
      snap,
      titleId,
      position,
      opts,
      true
    );
    host = picker;
    shellMode = nextMode;

    if (snap.inline) {
      target.append(picker);
      return;
    }

    if (snap.popover) {
      portalRoot = picker;
      document.body.append(picker);
      cleanups.push(
        attachFocusTrap(picker, true),
        attachEscape(() => controller.close(), true),
        attachClickOutside(
          () => controller.close(),
          true,
          picker,
          options.anchorEl
        ),
        attachPopoverPosition(
          options.anchorEl,
          true,
          true,
          picker,
          (pos) => {
            position = pos;
            if (pos) {
              picker.style.position = "fixed";
              picker.style.top = `${pos.top}px`;
              picker.style.left = `${pos.left}px`;
            }
          }
        )
      );
      return;
    }

    const themeAttr = resolveThemeAttr(options.theme, options.anchorEl);
    const backdrop = el("div", {
      className: "ctp-calendar-time-picker-absolute-container",
      onClick: (event: Event) => {
        if (event.target === event.currentTarget) {
          controller.close();
        }
      },
    });
    if (themeAttr) {
      backdrop.setAttribute("data-ctp-theme", themeAttr);
    }
    backdrop.append(picker);
    portalRoot = backdrop;
    document.body.append(backdrop);
    cleanups.push(
      attachFocusTrap(picker, true),
      attachEscape(() => controller.close(), true)
    );
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

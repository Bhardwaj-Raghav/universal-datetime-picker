import { describe, expect, it } from "vitest";
import {
  buildCalendarMonth,
  canNavigateNext,
  canNavigatePrev,
  clampToSelectableDate,
  clampViewMonth,
  isDayDisabled,
  isMonthSelectable,
  isYearSelectable,
} from "../src/core/logic/calendar";
import { PickerController } from "../src/core/controller";
import { dayjs } from "../src/utils/date";

describe("clampToSelectableDate", () => {
  it("returns today when it is selectable", () => {
    const today = dayjs().startOf("day");
    expect(clampToSelectableDate(today, {}).isSame(today, "day")).toBe(true);
  });

  it("clamps to maxDate when today is after the allowed window", () => {
    const max = dayjs().subtract(5, "day").startOf("day");
    const clamped = clampToSelectableDate(dayjs(), { maxDate: max.toDate() });
    expect(clamped.isSame(max, "day")).toBe(true);
    expect(isDayDisabled(clamped, { maxDate: max.toDate() })).toBe(false);
  });

  it("clamps to minDate when today is before the allowed window", () => {
    const min = dayjs().add(5, "day").startOf("day");
    const clamped = clampToSelectableDate(dayjs(), { minDate: min.toDate() });
    expect(clamped.isSame(min, "day")).toBe(true);
    expect(isDayDisabled(clamped, { minDate: min.toDate() })).toBe(false);
  });
});

describe("buildCalendarMonth", () => {
  it("always returns 6 weeks for short and long months", () => {
    // Feb 2021 starts on Monday with weekStartsOn Sunday → often 4–5 weeks
    const feb = buildCalendarMonth({
      viewMonth: dayjs("2021-02-01"),
      weekStartsOn: 0,
    });
    // Aug 2025 can span 6 weeks depending on start day
    const long = buildCalendarMonth({
      viewMonth: dayjs("2025-08-01"),
      weekStartsOn: 0,
    });
    expect(feb).toHaveLength(6);
    expect(long).toHaveLength(6);
    expect(feb.every((week) => week.length === 7)).toBe(true);
    expect(long.every((week) => week.length === 7)).toBe(true);
  });
});

describe("month/year navigation bounds", () => {
  const min = dayjs("2024-03-10");
  const max = dayjs("2024-06-20");
  const opts = { minDate: min.toDate(), maxDate: max.toDate() };

  it("marks months outside the window as not selectable", () => {
    expect(isMonthSelectable(dayjs("2024-02-01"), opts)).toBe(false);
    expect(isMonthSelectable(dayjs("2024-03-01"), opts)).toBe(true);
    expect(isMonthSelectable(dayjs("2024-06-01"), opts)).toBe(true);
    expect(isMonthSelectable(dayjs("2024-07-01"), opts)).toBe(false);
  });

  it("marks years outside the window as not selectable", () => {
    expect(isYearSelectable(2023, opts)).toBe(false);
    expect(isYearSelectable(2024, opts)).toBe(true);
    expect(isYearSelectable(2025, opts)).toBe(false);
  });

  it("clamps view month into the selectable window", () => {
    expect(
      clampViewMonth(dayjs("2024-01-01"), opts).format("YYYY-MM")
    ).toBe("2024-03");
    expect(
      clampViewMonth(dayjs("2024-12-01"), opts).format("YYYY-MM")
    ).toBe("2024-06");
  });

  it("disables prev/next arrows at the edges", () => {
    expect(canNavigatePrev(dayjs("2024-03-01"), "day", opts)).toBe(false);
    expect(canNavigateNext(dayjs("2024-03-01"), "day", opts)).toBe(true);
    expect(canNavigatePrev(dayjs("2024-06-01"), "day", opts)).toBe(true);
    expect(canNavigateNext(dayjs("2024-06-01"), "day", opts)).toBe(false);
  });

  it("PickerController refuses to navigate past min/max", () => {
    const controller = new PickerController({
      inline: true,
      mode: "date",
      minDate: min.toDate(),
      maxDate: max.toDate(),
      value: dayjs("2024-03-15").toDate(),
    });

    expect(controller.getSnapshot().canNavigatePrev).toBe(false);
    controller.navigatePrev();
    expect(controller.getSnapshot().viewMonth.format("YYYY-MM")).toBe("2024-03");

    controller.setViewMonth(dayjs("2024-06-01"));
    expect(controller.getSnapshot().canNavigateNext).toBe(false);
    controller.navigateNext();
    expect(controller.getSnapshot().viewMonth.format("YYYY-MM")).toBe("2024-06");

    controller.selectMonth(1);
    expect(controller.getSnapshot().viewMonth.format("YYYY-MM")).toBe("2024-06");

    controller.selectMonth(4);
    expect(controller.getSnapshot().viewMonth.format("YYYY-MM")).toBe("2024-05");
  });

  it("respects disablePastDates for previous month navigation", () => {
    const today = dayjs().startOf("day");
    const controller = new PickerController({
      inline: true,
      mode: "date",
      disablePastDates: true,
      value: today.toDate(),
    });
    expect(controller.getSnapshot().canNavigatePrev).toBe(false);
    controller.navigatePrev();
    expect(controller.getSnapshot().viewMonth.isSame(today, "month")).toBe(
      true
    );
  });
});

import { describe, expect, it } from "vitest";
import { buildCalendarMonth } from "../src/calendar";
import { dayjs, parseValue, formatValue, to12Hour, to24Hour, resolveFormat, buildTimeValue } from "../src/utils/date";

describe("buildCalendarMonth", () => {
  it("includes the last day of the month as current month", () => {
    const weeks = buildCalendarMonth({
      viewMonth: dayjs("2024-01-15"),
    });
    const days = weeks.flat();
    const jan31 = days.find((d) => d.date.format("YYYY-MM-DD") === "2024-01-31");
    expect(jan31).toBeDefined();
    expect(jan31!.isCurrentMonth).toBe(true);
  });

  it("marks selection by full date, not day-of-month alone", () => {
    const selected = dayjs("2024-02-15");
    const weeks = buildCalendarMonth({
      viewMonth: dayjs("2024-02-01"),
      selected,
    });
    const selectedDays = weeks.flat().filter((d) => d.isSelected);
    expect(selectedDays).toHaveLength(1);
    expect(selectedDays[0]!.date.format("YYYY-MM-DD")).toBe("2024-02-15");
  });

  it("disables future dates with year awareness", () => {
    const weeks = buildCalendarMonth({
      viewMonth: dayjs().add(1, "year").startOf("month"),
      disableFutureDates: true,
    });
    const futureDays = weeks.flat().filter((d) => d.isCurrentMonth);
    expect(futureDays.every((d) => d.isDisabled)).toBe(true);
  });

  it("respects minDate and maxDate", () => {
    const weeks = buildCalendarMonth({
      viewMonth: dayjs("2024-06-01"),
      minDate: "2024-06-10",
      maxDate: "2024-06-20",
    });
    const jun5 = weeks.flat().find((d) => d.date.format("YYYY-MM-DD") === "2024-06-05");
    const jun15 = weeks.flat().find((d) => d.date.format("YYYY-MM-DD") === "2024-06-15");
    const jun25 = weeks.flat().find((d) => d.date.format("YYYY-MM-DD") === "2024-06-25");
    expect(jun5!.isDisabled).toBe(true);
    expect(jun15!.isDisabled).toBe(false);
    expect(jun25!.isDisabled).toBe(true);
  });

  it("honors weekStartsOn Monday", () => {
    const weeks = buildCalendarMonth({
      viewMonth: dayjs("2024-07-01"),
      weekStartsOn: 1,
    });
    expect(weeks[0]![0]!.date.day()).toBe(1);
  });
});

describe("parseValue / formatValue", () => {
  it("parses and formats with custom format", () => {
    const format = "YYYY-MM-DD HH:mm:ss";
    const parsed = parseValue("2024-07-19 14:30:00", format);
    expect(parsed).not.toBeNull();
    expect(formatValue(parsed, format)).toBe("2024-07-19 14:30:00");
  });

  it("returns null for invalid strings", () => {
    expect(parseValue("not-a-date", "YYYY-MM-DD")).toBeNull();
  });
});

describe("12-hour conversion", () => {
  it("converts 24h to 12h and back", () => {
    expect(to12Hour(0)).toEqual({ hour: 12, isAm: true });
    expect(to12Hour(13)).toEqual({ hour: 1, isAm: false });
    expect(to24Hour(12, true)).toBe(0);
    expect(to24Hour(1, false)).toBe(13);
  });
});

describe("resolveFormat / buildTimeValue", () => {
  it("derives format from mode and showSeconds", () => {
    expect(resolveFormat({ mode: "date" })).toBe("YYYY-MM-DD");
    expect(resolveFormat({ mode: "time" })).toBe("HH:mm:ss");
    expect(resolveFormat({ mode: "time", showSeconds: false })).toBe("HH:mm");
    expect(resolveFormat({ mode: "time", use12Hours: true })).toBe("hh:mm:ss A");
    expect(
      resolveFormat({ mode: "datetime", use12Hours: true, showSeconds: false })
    ).toBe("YYYY-MM-DD hh:mm A");
  });

  it("builds TimeValue with hour 1–12 and hour24 0–23", () => {
    const value = buildTimeValue(dayjs("2024-07-10 14:30:15"), "HH:mm:ss");
    expect(value).toEqual({
      hour: 2,
      hour24: 14,
      minute: 30,
      second: 15,
      ampm: "PM",
      formatted: "14:30:15",
    });
  });
});

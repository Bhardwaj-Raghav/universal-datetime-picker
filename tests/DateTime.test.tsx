import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateTime } from "../src/DateTime";
import { DateTimeInput } from "../src/DateTimeInput";
import { dayjs } from "../src/utils/date";

describe("DateTime", () => {
  it("calls onChange with formatted value when inline date is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTime
        inline
        asString
        defaultValue={dayjs("2024-07-15 10:00:00")}
        onChange={onChange}
        mode="date"
      />
    );

    await user.click(
      screen.getByRole("gridcell", { name: /July 15, 2024/i })
    );
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0]![0]).toMatch(/^2024-07-15/);
  });

  it("returns a Date when asString is omitted for date mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTime
        inline
        defaultValue={dayjs("2024-07-15 10:00:00")}
        onChange={onChange}
        mode="date"
      />
    );

    await user.click(
      screen.getByRole("gridcell", { name: /July 15, 2024/i })
    );
    expect(onChange.mock.calls[0]![0]).toBeInstanceOf(Date);
  });

  it("returns a Date when asString is false for date mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTime
        inline
        asString={false}
        defaultValue={dayjs("2024-07-15 10:00:00")}
        onChange={onChange}
        mode="date"
      />
    );

    await user.click(
      screen.getByRole("gridcell", { name: /July 15, 2024/i })
    );
    const result = onChange.mock.calls[0]![0];
    expect(result).toBeInstanceOf(Date);
    expect(dayjs(result as Date).format("YYYY-MM-DD")).toBe("2024-07-15");
  });

  it("returns a Date when asString is false for datetime mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTime
        inline
        asString={false}
        defaultValue={dayjs("2024-07-15 10:30:45")}
        onChange={onChange}
        mode="datetime"
      />
    );

    await user.click(
      screen.getByRole("gridcell", { name: /July 15, 2024/i })
    );
    const result = onChange.mock.calls[0]![0];
    expect(result).toBeInstanceOf(Date);
    expect(dayjs(result as Date).format("YYYY-MM-DD HH:mm:ss")).toBe(
      "2024-07-15 10:30:45"
    );
  });

  it("returns a TimeValue when asString is false for time mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTime
        inline
        asString={false}
        defaultValue={dayjs("2024-07-10 14:30:15")}
        onChange={onChange}
        mode="time"
      />
    );

    await user.click(screen.getByRole("button", { name: /Select minutes/i }));
    const minutesList = screen.getByRole("listbox", { name: /minutes/i });
    await user.click(within(minutesList).getByRole("option", { name: "31" }));
    expect(onChange.mock.calls[0]![0]).toEqual({
      hour: 2,
      hour24: 14,
      minute: 31,
      second: 15,
      ampm: "PM",
      formatted: "14:31:15",
    });
  });

  it("hides seconds when showSeconds is false", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DateTime
        inline
        asString={false}
        showSeconds={false}
        defaultValue={dayjs("2024-07-10 14:30:15")}
        onChange={onChange}
        mode="time"
      />
    );

    expect(screen.queryByRole("button", { name: /Select seconds/i })).toBeNull();
    expect(container.querySelector(".ctp-no-seconds")).toBeTruthy();
    expect(container.querySelector(".ctp-mode-time")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /Select minutes/i }));
    const minutesList = screen.getByRole("listbox", { name: /minutes/i });
    await user.click(within(minutesList).getByRole("option", { name: "31" }));
    expect(onChange.mock.calls[0]![0]).toMatchObject({
      hour: 2,
      hour24: 14,
      minute: 31,
      formatted: "14:31",
    });
  });

  it("selects a day and highlights by full date", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTime
        inline
        asString
        defaultValue={dayjs("2024-07-10 12:00:00")}
        onChange={onChange}
        mode="date"
      />
    );

    const day15 = screen.getByRole("gridcell", {
      name: /July 15, 2024/i,
    });
    await user.click(day15);
    expect(day15).toHaveAttribute("aria-selected", "true");
    expect(onChange.mock.calls[0]![0]).toContain("2024-07-15");
  });

  it("does not highlight a day when opened with no initial value", () => {
    render(<DateTime inline mode="date" />);
    const grid = screen.getByRole("grid");
    const selected = within(grid)
      .queryAllByRole("gridcell")
      .filter((cell) => cell.getAttribute("aria-selected") === "true");
    expect(selected).toHaveLength(0);
  });

  it("commits overlay date selection without OK", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <DateTime
        open
        asString
        onOpenChange={onOpenChange}
        defaultValue={dayjs("2024-07-10 12:00:00")}
        onChange={onChange}
        mode="date"
      />
    );

    await user.click(
      screen.getByRole("gridcell", { name: /July 15, 2024/i })
    );
    expect(onChange).toHaveBeenCalledWith("2024-07-15");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("button", { name: /^OK$/i })).toBeNull();
  });

  it("commits datetime overlay only when OK is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <DateTime
        open
        asString={false}
        onOpenChange={onOpenChange}
        defaultValue={dayjs("2024-07-10 12:00:00")}
        onChange={onChange}
        mode="datetime"
      />
    );

    await user.click(
      screen.getByRole("gridcell", { name: /July 15, 2024/i })
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole("button", { name: /^OK$/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^OK$/i }));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0]![0]).toBeInstanceOf(Date);
    expect(dayjs(onChange.mock.calls[0]![0] as Date).format("YYYY-MM-DD")).toBe(
      "2024-07-15"
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not commit when overlay is closed without selecting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTime
        open
        asString
        defaultValue={dayjs("2024-07-10 12:00:00")}
        onChange={onChange}
        mode="date"
        disableFutureDates
      />
    );

    await user.click(screen.getByRole("button", { name: /^Close$/i }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("opens on maxDate month when max is in the past", () => {
    const max = dayjs().subtract(10, "day");
    render(
      <DateTime
        inline
        mode="date"
        maxDate={max.toDate()}
      />
    );
    expect(
      screen.getByRole("button", {
        name: new RegExp(`${max.format("MMMM YYYY")}.*Choose month`, "i"),
      })
    ).toBeInTheDocument();
  });

  it("opens on minDate month when min is in the future", () => {
    const min = dayjs().add(10, "day");
    render(
      <DateTime
        inline
        mode="date"
        minDate={min.toDate()}
      />
    );
    expect(
      screen.getByRole("button", {
        name: new RegExp(`${min.format("MMMM YYYY")}.*Choose month`, "i"),
      })
    ).toBeInTheDocument();
  });

  it("resets month/year panel when overlay reopens", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <DateTime
        open
        asString
        onOpenChange={onOpenChange}
        defaultValue={dayjs("2024-07-10")}
        mode="date"
      />
    );

    await user.click(
      screen.getByRole("button", { name: /July 2024.*Choose month/i })
    );
    expect(screen.getByRole("grid", { name: /Choose month/i })).toBeInTheDocument();

    rerender(
      <DateTime
        open={false}
        asString
        onOpenChange={onOpenChange}
        defaultValue={dayjs("2024-07-10")}
        mode="date"
      />
    );

    rerender(
      <DateTime
        open
        asString
        onOpenChange={onOpenChange}
        defaultValue={dayjs("2024-07-10")}
        mode="date"
      />
    );

    expect(screen.getByRole("grid", { name: /Choose date/i })).toBeInTheDocument();
  });

  it("closes without clearing when Close is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <DateTime
        open
        asString
        onOpenChange={onOpenChange}
        defaultValue={dayjs("2024-07-10 12:00:00")}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("button", { name: /^Close$/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clears value when Clear is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTime
        inline
        asString
        defaultValue={dayjs("2024-07-10 12:00:00")}
        onChange={onChange}
      />
    );
    await user.click(screen.getByRole("button", { name: /Clear/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("supports keyboard navigation on the grid", async () => {
    const user = userEvent.setup();
    render(
      <DateTime
        inline
        defaultValue={dayjs("2024-07-10 12:00:00")}
        mode="date"
      />
    );
    const grid = screen.getByRole("grid");
    grid.focus();
    await user.keyboard("{ArrowRight}");
    const focused = within(grid).getByRole("gridcell", {
      name: /July 11, 2024/i,
    });
    expect(focused).toHaveAttribute("tabindex", "0");
  });

  it("Home/End honor weekStartsOn", async () => {
    const user = userEvent.setup();
    render(
      <DateTime
        inline
        defaultValue={dayjs("2024-07-10 12:00:00")}
        mode="date"
        weekStartsOn={1}
      />
    );
    const grid = screen.getByRole("grid");
    grid.focus();
    await user.keyboard("{Home}");
    // July 10 2024 is Wednesday; week starting Monday => July 8
    expect(
      within(grid).getByRole("gridcell", { name: /July 8, 2024/i })
    ).toHaveAttribute("tabindex", "0");

    await user.keyboard("{End}");
    expect(
      within(grid).getByRole("gridcell", { name: /July 14, 2024/i })
    ).toHaveAttribute("tabindex", "0");
  });

  it("opens month then year selector from the title", async () => {
    const user = userEvent.setup();
    render(
      <DateTime
        inline
        asString
        defaultValue={dayjs("2024-07-10")}
        mode="date"
      />
    );

    await user.click(
      screen.getByRole("button", { name: /July 2024.*Choose month/i })
    );
    expect(screen.getByRole("grid", { name: /Choose month/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /2024.*Choose year/i }));
    expect(screen.getByRole("grid", { name: /Choose year/i })).toBeInTheDocument();

    await user.click(screen.getByRole("gridcell", { name: "2025" }));
    expect(screen.getByRole("grid", { name: /Choose month/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /2025.*Choose year/i })).toBeInTheDocument();

    await user.click(screen.getByRole("gridcell", { name: /March 2025/i }));
    expect(screen.getByRole("grid", { name: /Choose date/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /March 2025.*Choose month/i })
    ).toBeInTheDocument();
  });

  it("highlights the current month and year without selecting them", async () => {
    const user = userEvent.setup();
    const now = dayjs();
    render(<DateTime inline asString defaultValue={now} mode="date" />);

    await user.click(
      screen.getByRole("button", { name: new RegExp("Choose month", "i") })
    );
    const currentMonthCell = screen.getByRole("gridcell", {
      name: new RegExp(now.format("MMMM YYYY"), "i"),
    });
    expect(currentMonthCell).toHaveAttribute("aria-current", "date");
    expect(currentMonthCell).not.toHaveAttribute("aria-selected");

    await user.click(
      screen.getByRole("button", { name: new RegExp("Choose year", "i") })
    );
    const currentYearCell = screen.getByRole("gridcell", {
      name: String(now.year()),
    });
    expect(currentYearCell).toHaveAttribute("aria-current", "date");
    expect(currentYearCell).not.toHaveAttribute("aria-selected");
  });

  it("confirms 12-hour AM/PM selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTime
        inline
        asString
        defaultValue={dayjs("2024-07-10 09:30:00")}
        onChange={onChange}
        mode="time"
        use12Hours
        format="YYYY-MM-DD hh:mm:ss A"
      />
    );

    await user.click(screen.getByRole("button", { name: /Select am-pm/i }));
    await user.click(screen.getByRole("option", { name: "PM" }));

    expect(onChange.mock.calls[0]![0]).toMatch(/PM$/i);
    expect(onChange.mock.calls[0]![0]).toContain("09:30:00");
  });

  it("uses custom labels", () => {
    render(
      <DateTime
        inline
        mode="date"
        defaultValue={dayjs("2024-07-10")}
        labels={{ ok: "Confirm", clear: "Wipe", close: "Dismiss" }}
      />
    );
    expect(screen.queryByRole("button", { name: "Confirm" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wipe" })).toBeInTheDocument();
    // Close and OK are omitted for inline pickers
    expect(
      screen.queryByRole("button", { name: "Dismiss" })
    ).not.toBeInTheDocument();
  });

  it("shows custom close label in overlay mode", () => {
    render(
      <DateTime
        mode="date"
        defaultValue={dayjs("2024-07-10")}
        labels={{ ok: "Confirm", clear: "Wipe", close: "Dismiss" }}
      />
    );
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("shows date and time together by default without mode tabs", () => {
    render(
      <DateTime
        inline
        mode="datetime"
        defaultValue={dayjs("2024-07-10 12:00:00")}
      />
    );
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Select hours/i })).toBeInTheDocument();
  });

  it("shows Date/Time tabs when layout is tabs", () => {
    render(
      <DateTime
        inline
        mode="datetime"
        layout="tabs"
        defaultValue={dayjs("2024-07-10 12:00:00")}
      />
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Date/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Time/i })).toBeInTheDocument();
  });

  it("hides mode tabs for date-only and time-only", () => {
    const { rerender } = render(
      <DateTime inline mode="date" defaultValue={dayjs("2024-07-10")} />
    );
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();

    rerender(
      <DateTime inline mode="time" defaultValue={dayjs("2024-07-10 12:00:00")} />
    );
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });
});

describe("DateTimeInput", () => {
  it("renders a calendar icon by default", () => {
    render(
      <DateTimeInput
        asString
        value="2024-07-10 12:00:00"
        mode="date"
      />
    );
    expect(document.querySelector(".ctp-input-icon-btn")).toBeTruthy();
    expect(document.querySelector(".ctp-input-with-icon")).toBeTruthy();
  });

  it("supports customInput and noStyle", async () => {
    const user = userEvent.setup();
    render(
      <DateTimeInput
        noStyle
        asString
        customInput={<button type="button">Pick</button>}
        mode="date"
      />
    );

    const trigger = screen.getByText("Pick");
    expect(trigger.className).not.toContain("ctp-input-root");
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens popover and updates controlled value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimeInput
        asString
        value="2024-07-10 12:00:00"
        onChange={onChange}
        mode="date"
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("2024-07-10");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("opens popover when asString is false and value is a Date", async () => {
    const user = userEvent.setup();
    render(
      <DateTimeInput
        asString={false}
        mode="datetime"
        use12Hours
        value={new Date("2024-07-10T12:00:00")}
        onChange={() => {}}
        placeholder="Pick date & time"
      />
    );

    const input = screen.getByRole("textbox");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes popover on outside click", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <div>
        <button type="button">Outside</button>
        <DateTimeInput
          asString
          defaultOpen
          onOpenChange={onOpenChange}
          value="2024-07-10 12:00:00"
          mode="date"
        />
      </div>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

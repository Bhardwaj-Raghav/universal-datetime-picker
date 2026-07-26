import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateTime } from "../src/DateTime";
import { DateTimeInput } from "../src/DateTimeInput";
import { dayjs } from "../src/utils/date";

describe("DateTime", () => {
  it("calls onChange with formatted value on OK", async () => {
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

    await user.click(screen.getByRole("button", { name: /OK/i }));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0]![0]).toMatch(/^2024-07-15/);
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

    await user.click(screen.getByRole("button", { name: /OK/i }));
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

    await user.click(screen.getByRole("button", { name: /OK/i }));
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

    await user.click(screen.getByRole("button", { name: /OK/i }));
    expect(onChange.mock.calls[0]![0]).toEqual({
      hour: 2,
      hour24: 14,
      minute: 30,
      second: 15,
      ampm: "PM",
      formatted: "14:30:15",
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

    await user.click(screen.getByRole("button", { name: /OK/i }));
    expect(onChange.mock.calls[0]![0]).toMatchObject({
      hour: 2,
      hour24: 14,
      minute: 30,
      formatted: "14:30",
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
    await user.click(screen.getByRole("button", { name: /OK/i }));
    expect(onChange.mock.calls[0]![0]).toContain("2024-07-15");
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
    await user.click(screen.getByRole("button", { name: /OK/i }));

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
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wipe" })).toBeInTheDocument();
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

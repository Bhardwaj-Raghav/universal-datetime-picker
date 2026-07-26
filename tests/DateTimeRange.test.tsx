import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DateTimeRange } from "../src/DateTimeRange";
import { dayjs } from "../src/utils/date";

describe("DateTimeRange", () => {
  it("selects a start and end date then confirms", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimeRange
        inline
        asString
        defaultValue={{
          start: dayjs("2024-07-10"),
          end: null,
        }}
        onChange={onChange}
      />
    );

    const day20 = screen.getByRole("gridcell", {
      name: /July 20, 2024/i,
    });
    await user.click(day20);

    expect(onChange).toHaveBeenCalledWith({
      start: "2024-07-10",
      end: "2024-07-20",
    });
  });

  it("returns Date objects when asString is false", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimeRange
        inline
        asString={false}
        defaultValue={{
          start: dayjs("2024-07-10"),
          end: null,
        }}
        onChange={onChange}
      />
    );

    await user.click(
      screen.getByRole("gridcell", { name: /July 20, 2024/i })
    );

    const payload = onChange.mock.calls.at(-1)![0] as {
      start: Date;
      end: Date;
    };
    expect(payload.start).toBeInstanceOf(Date);
    expect(payload.end).toBeInstanceOf(Date);
    expect(dayjs(payload.start).format("YYYY-MM-DD")).toBe("2024-07-10");
    expect(dayjs(payload.end).format("YYYY-MM-DD")).toBe("2024-07-20");
  });

  it("clears controlled value when value becomes null", () => {
    const { rerender } = render(
      <DateTimeRange
        inline
        value={{ start: dayjs("2024-07-10"), end: dayjs("2024-07-20") }}
      />
    );

    expect(document.querySelector(".ctp-range-title")?.textContent).toMatch(
      /Jul 10, 2024/
    );

    rerender(<DateTimeRange inline value={null} />);
    expect(document.querySelector(".ctp-range-title")?.textContent).toBe(
      "Start — End"
    );
  });

  it("supports keyboard navigation on the grid", async () => {
    const user = userEvent.setup();
    render(
      <DateTimeRange inline defaultValue={{ start: dayjs("2024-07-10"), end: null }} />
    );
    const grid = screen.getByRole("grid");
    grid.focus();
    await user.keyboard("{ArrowRight}");
    expect(
      within(grid).getByRole("gridcell", { name: /July 11, 2024/i })
    ).toHaveAttribute("tabindex", "0");
  });

  it("keeps partial selection with inline onChange handlers", async () => {
    const user = userEvent.setup();
    const start = dayjs().startOf("month").date(10);
    const startLabel = start.format("dddd, MMMM D, YYYY");
    function Demo() {
      const [range, setRange] = useState<{
        start: Date | null;
        end: Date | null;
      }>({ start: null, end: null });
      return (
        <DateTimeRange
          inline
          asString={false}
          value={range}
          onChange={(next) =>
            setRange({
              start: next.start instanceof Date ? next.start : null,
              end: next.end instanceof Date ? next.end : null,
            })
          }
        />
      );
    }
    render(<Demo />);
    await user.click(
      screen.getByRole("gridcell", { name: new RegExp(startLabel, "i") })
    );
    expect(
      screen.getByRole("gridcell", { name: new RegExp(startLabel, "i") })
    ).toHaveClass("ctp-range-start");
  });

  it("selects end date with keyboard Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimeRange
        inline
        asString
        defaultValue={{ start: dayjs("2024-07-10"), end: null }}
        onChange={onChange}
      />
    );
    const grid = screen.getByRole("grid");
    grid.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    expect(onChange).toHaveBeenCalledWith({
      start: "2024-07-10",
      end: "2024-07-12",
    });
  });
});

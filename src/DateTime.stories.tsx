import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateTime } from "./DateTime";
import { DateTimeInput } from "./DateTimeInput";
import { DateTimeRange } from "./DateTimeRange";
import type { DateTimeChangeValue, TimeValue } from "./types";
import { dayjs } from "./utils/date";

const meta: Meta<typeof DateTime> = {
  title: "DateTime",
  component: DateTime,
};

export default meta;
type Story = StoryObj<typeof DateTime>;

function formatPreview(value: DateTimeChangeValue): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toString();
  }
  return JSON.stringify(value, null, 2);
}

export const Inline: Story = {
  args: {
    inline: true,
    mode: "datetime",
    asString: true,
  },
};

export const TabsLayout: Story = {
  name: "Separate view (tabs)",
  args: {
    inline: true,
    mode: "datetime",
    layout: "tabs",
    asString: true,
  },
};

export const DateOnly: Story = {
  args: {
    inline: true,
    mode: "date",
    asString: true,
  },
};

export const Time12Hour: Story = {
  args: {
    inline: true,
    mode: "time",
    use12Hours: true,
    asString: true,
  },
};

export const Time24HourCompact: Story = {
  name: "Time only · 24-hour (compact)",
  args: {
    inline: true,
    mode: "time",
    use12Hours: false,
    asString: true,
  },
};

export const TimeNoSeconds: Story = {
  name: "Time only · no seconds",
  args: {
    inline: true,
    mode: "time",
    showSeconds: false,
    asString: true,
  },
};

export const MinMax: Story = {
  args: {
    inline: true,
    mode: "date",
    asString: true,
    minDate: dayjs("2024-07-05"),
    maxDate: dayjs("2024-07-25"),
    defaultValue: dayjs("2024-07-15"),
  },
};

export const WeekStartsMonday: Story = {
  args: {
    inline: true,
    mode: "date",
    asString: true,
    weekStartsOn: 1,
    defaultValue: dayjs("2024-07-10"),
  },
};

function AsDateObjectDemo() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <div>
      <DateTime
        inline
        mode="date"
        asString={false}
        value={value}
        onChange={(next) => setValue(next instanceof Date ? next : null)}
      />
      <pre style={{ marginTop: 12, fontSize: 12 }}>{formatPreview(value)}</pre>
    </div>
  );
}

export const AsDateObject: StoryObj = {
  name: "asString={false} · Date",
  render: () => <AsDateObjectDemo />,
};

function AsTimeValueDemo() {
  const [value, setValue] = useState<TimeValue | null>(null);
  return (
    <div>
      <DateTime
        inline
        mode="time"
        asString={false}
        onChange={(next) =>
          setValue(
            next && typeof next === "object" && !(next instanceof Date)
              ? next
              : null
          )
        }
      />
      <pre style={{ marginTop: 12, fontSize: 12 }}>{formatPreview(value)}</pre>
    </div>
  );
}

export const AsTimeValue: StoryObj = {
  name: "asString={false} · TimeValue",
  render: () => <AsTimeValueDemo />,
};

function InputDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div style={{ minHeight: 420 }}>
      <DateTimeInput
        asString
        value={value}
        onChange={(next) => setValue(typeof next === "string" ? next : null)}
        use12Hours
      />
      <p style={{ marginTop: 12 }}>{value ?? "null"}</p>
    </div>
  );
}

export const WithInput: StoryObj = {
  render: () => <InputDemo />,
};

function CompactTimePopoverDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div style={{ minHeight: 280 }}>
      <DateTimeInput
        asString
        mode="time"
        showSeconds={false}
        value={value}
        onChange={(next) => setValue(typeof next === "string" ? next : null)}
        placeholder="Compact time popover"
      />
      <p style={{ marginTop: 12 }}>{value ?? "null"}</p>
    </div>
  );
}

export const CompactTimePopover: StoryObj = {
  name: "Time popover · compact",
  render: () => <CompactTimePopoverDemo />,
};

function EdgePopoverDemo() {
  const [value, setValue] = useState<string | null>("2024-07-10");
  return (
    <div
      style={{
        minHeight: 480,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        padding: 16,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <DateTimeInput
        asString
        value={value}
        onChange={(next) => setValue(typeof next === "string" ? next : null)}
        mode="date"
        placeholder="Near viewport edge"
      />
    </div>
  );
}

export const EdgePopover: StoryObj = {
  parameters: { layout: "fullscreen" },
  render: () => <EdgePopoverDemo />,
};

function RangeDemo() {
  const [range, setRange] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: null,
    end: null,
  });
  return (
    <div>
      <DateTimeRange
        inline
        asString
        value={range}
        onChange={(next) =>
          setRange({
            start: typeof next.start === "string" ? next.start : null,
            end: typeof next.end === "string" ? next.end : null,
          })
        }
      />
      <p style={{ marginTop: 12 }}>
        {range.start ?? "-"} → {range.end ?? "-"}
      </p>
    </div>
  );
}

export const Range: StoryObj = {
  render: () => <RangeDemo />,
};

export const FrenchLocale: Story = {
  args: {
    inline: true,
    locale: "fr",
    weekStartsOn: 1,
    asString: true,
  },
  loaders: [
    async () => {
      await import("dayjs/locale/fr");
      return {};
    },
  ],
};

function DarkThemeDemo() {
  const [dateValue, setDateValue] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string | null>(null);
  return (
    <div
      data-ctp-theme="dark"
      style={{
        padding: 24,
        background: "#111827",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <DateTime
        inline
        asString
        mode="date"
        value={dateValue}
        onChange={(next) =>
          setDateValue(typeof next === "string" ? next : null)
        }
      />
      <DateTimeInput
        asString
        mode="time"
        use12Hours
        value={inputValue}
        onChange={(next) =>
          setInputValue(typeof next === "string" ? next : null)
        }
        defaultOpen={false}
        placeholder="Dark time popover (click to open)"
      />
    </div>
  );
}

export const DarkTheme: StoryObj = {
  name: "Dark theme (date + time)",
  render: () => <DarkThemeDemo />,
};

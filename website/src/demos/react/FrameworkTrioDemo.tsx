import { useState } from "react";
import DateTime, { DateTimeInput, DateTimeRange } from "universal-datetime-picker";

function preview(value: unknown): string {
  if (value === null || value === undefined) {
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

export default function FrameworkTrioDemo() {
  const [date, setDate] = useState<Date | null>(null);
  const [input, setInput] = useState<Date | null>(null);
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  return (
    <div className="demo-trio">
      <div className="demo-trio-block showcase-block">
        <h3>Inline date · Date object</h3>
        <DateTime
          inline
          mode="date"
          asString={false}
          value={date}
          onChange={(next) => setDate(next instanceof Date ? next : null)}
        />
        <pre className="demo-value">{preview(date)}</pre>
      </div>

      <div className="demo-trio-block showcase-block">
        <h3>Popover datetime input</h3>
        <DateTimeInput
          asString={false}
          mode="datetime"
          use12Hours
          value={input}
          onChange={(next) => setInput(next instanceof Date ? next : null)}
          placeholder="Pick date & time"
        />
        <pre className="demo-value">{preview(input)}</pre>
      </div>

      <div className="demo-trio-block showcase-block">
        <h3>Date range</h3>
        <DateTimeRange
          inline
          asString={false}
          onChange={(next) =>
            setRange({
              start: next.start instanceof Date ? next.start : null,
              end: next.end instanceof Date ? next.end : null,
            })
          }
        />
        <pre className="demo-value">
          {preview(range.start)} → {preview(range.end)}
        </pre>
      </div>
    </div>
  );
}

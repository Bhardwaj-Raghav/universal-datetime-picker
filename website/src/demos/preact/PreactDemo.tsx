/** @jsxImportSource preact */
import { useState } from "preact/hooks";
import { defineCustomElements } from "universal-datetime-picker/wc";

defineCustomElements();

function preview(value: unknown): string {
  if (value == null) return "null";
  if (value instanceof Date) return value.toString();
  return String(value);
}

declare module "preact" {
  namespace JSX {
    interface IntrinsicElements {
      "datetime-picker": preact.JSX.HTMLAttributes<HTMLElement> & {
        inline?: boolean;
        mode?: string;
        "as-string"?: string;
        onchange?: (e: Event) => void;
      };
      "datetime-picker-input": preact.JSX.HTMLAttributes<HTMLElement> & {
        mode?: string;
        "as-string"?: string;
        use12hours?: boolean;
        placeholder?: string;
        onchange?: (e: Event) => void;
      };
      "datetime-picker-range": preact.JSX.HTMLAttributes<HTMLElement> & {
        inline?: boolean;
        "as-string"?: string;
        onchange?: (e: Event) => void;
      };
    }
  }
}

export default function PreactDemo() {
  const [date, setDate] = useState<Date | null>(null);
  const [input, setInput] = useState<Date | null>(null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  return (
    <div className="demo-trio">
      <div className="demo-trio-block showcase-block">
        <h3>Inline date · Date object</h3>
        <datetime-picker
          inline
          mode="date"
          as-string="false"
          onchange={(e: Event) => {
            const next = (e as CustomEvent).detail;
            setDate(next instanceof Date ? next : null);
          }}
        />
        <pre className="demo-value">{preview(date)}</pre>
      </div>

      <div className="demo-trio-block showcase-block">
        <h3>Popover datetime input</h3>
        <datetime-picker-input
          mode="datetime"
          as-string="false"
          use12hours
          placeholder="Pick date & time"
          onchange={(e: Event) => {
            const next = (e as CustomEvent).detail;
            setInput(next instanceof Date ? next : null);
          }}
        />
        <pre className="demo-value">{preview(input)}</pre>
      </div>

      <div className="demo-trio-block showcase-block">
        <h3>Date range</h3>
        <datetime-picker-range
          inline
          as-string="false"
          onchange={(e: Event) => {
            const next = (e as CustomEvent).detail as {
              start: Date | null;
              end: Date | null;
            };
            setRangeStart(next.start instanceof Date ? next.start : null);
            setRangeEnd(next.end instanceof Date ? next.end : null);
          }}
        />
        <pre className="demo-value">
          {preview(rangeStart)} → {preview(rangeEnd)}
        </pre>
      </div>
    </div>
  );
}

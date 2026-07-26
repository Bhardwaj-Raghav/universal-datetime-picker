/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";
import { defineCustomElements } from "universal-datetime-picker/wc";

defineCustomElements();

function preview(value: unknown): string {
  if (value == null) return "null";
  if (value instanceof Date) return value.toString();
  return String(value);
}

export default function SolidDemo() {
  const [date, setDate] = createSignal<Date | null>(null);
  const [input, setInput] = createSignal<Date | null>(null);
  const [rangeStart, setRangeStart] = createSignal<Date | null>(null);
  const [rangeEnd, setRangeEnd] = createSignal<Date | null>(null);

  return (
    <div class="demo-trio">
      <div class="demo-trio-block showcase-block">
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
        <pre class="demo-value">{preview(date())}</pre>
      </div>

      <div class="demo-trio-block showcase-block">
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
        <pre class="demo-value">{preview(input())}</pre>
      </div>

      <div class="demo-trio-block showcase-block">
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
        <pre class="demo-value">
          {preview(rangeStart())} → {preview(rangeEnd())}
        </pre>
      </div>
    </div>
  );
}

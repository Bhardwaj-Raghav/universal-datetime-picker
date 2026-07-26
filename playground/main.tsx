import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import DateTime, {
  DateTimeInput,
  DateTimeRange,
} from "../src/index";
import "../src/styles/datepicker.scss";
import "./playground.css";

function App() {
  const [value, setValue] = useState<string | null>(null);
  const [range, setRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [open, setOpen] = useState(false);

  return (
    <main className="playground">
      <h1>universal-datetime-picker</h1>
      <p className="subtitle">Local playground for the v2 API</p>

      <section>
        <h2>Input (popover)</h2>
        <DateTimeInput
          asString
          value={value}
          onChange={(next) => setValue(typeof next === "string" ? next : null)}
          placeholder="Pick a date & time"
          use12Hours
        />
        <p className="value">Value: {value ?? "null"}</p>
      </section>

      <section>
        <h2>Inline datetime</h2>
        <DateTime
          inline
          asString
          value={value}
          onChange={(next) => setValue(typeof next === "string" ? next : null)}
          disablePastDates
        />
      </section>

      <section>
        <h2>Modal overlay</h2>
        <button type="button" onClick={() => setOpen(true)}>
          Open picker
        </button>
        <DateTime
          open={open}
          onOpenChange={setOpen}
          asString
          value={value}
          onChange={(next) => setValue(typeof next === "string" ? next : null)}
          mode="datetime"
        />
      </section>

      <section>
        <h2>Date range</h2>
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
        <p className="value">
          Range: {range.start ?? "—"} → {range.end ?? "—"}
        </p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

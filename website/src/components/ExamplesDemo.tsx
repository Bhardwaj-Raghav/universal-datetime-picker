import { useState } from "react";
import DateTime, {
  DateTimeInput,
  DateTimeRange,
  type DateTimeChangeValue,
  type TimeValue,
} from "universal-datetime-picker";
import dayjs from "dayjs";
import fr from "dayjs/locale/fr";

dayjs.locale(fr);

const DEMO_BOUNDS = (() => {
  const today = dayjs().startOf("day");
  return {
    minDate: today.subtract(7, "day").toDate(),
    maxDate: today.add(14, "day").toDate(),
    bookingMax: today.add(30, "day").toDate(),
  };
})();

function previewValue(value: DateTimeChangeValue): string {
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

export default function ExamplesDemo() {
  const { minDate, maxDate, bookingMax } = DEMO_BOUNDS;

  const [dateOnly, setDateOnly] = useState<Date | null>(null);
  const [noFuture, setNoFuture] = useState<Date | null>(null);
  const [bounded, setBounded] = useState<Date | null>(null);
  const [timeOnly, setTimeOnly] = useState<TimeValue | null>(null);
  const [timeNoSeconds, setTimeNoSeconds] = useState<TimeValue | null>(null);
  const [combined, setCombined] = useState<Date | null>(null);
  const [tabsValue, setTabsValue] = useState<Date | null>(null);
  const [dateTimeInput, setDateTimeInput] = useState<string | null>(null);
  const [bookingInput, setBookingInput] = useState<string | null>(null);
  const [localeValue, setLocaleValue] = useState<Date | null>(null);
  const [darkDate, setDarkDate] = useState<Date | null>(null);
  const [darkInput, setDarkInput] = useState<string | null>(null);
  const [range, setRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  return (
    <div className="showcase-grid">
      <div className="showcase-block">
        <h3>Date · disable past</h3>
        <p className="showcase-note">
          <code>disablePastDates</code> — past days greyed out.
        </p>
        <DateTime
          inline
          mode="date"
          asString={false}
          value={dateOnly}
          onChange={(next) => setDateOnly(next instanceof Date ? next : null)}
          disablePastDates
        />
        <pre className="stage-value">{previewValue(dateOnly)}</pre>
      </div>

      <div className="showcase-block">
        <h3>Date · disable future</h3>
        <p className="showcase-note">
          <code>disableFutureDates</code> — future days blocked.
        </p>
        <DateTime
          inline
          mode="date"
          asString={false}
          value={noFuture}
          onChange={(next) => setNoFuture(next instanceof Date ? next : null)}
          disableFutureDates
        />
        <pre className="stage-value">{previewValue(noFuture)}</pre>
      </div>

      <div className="showcase-block">
        <h3>Date · min &amp; max</h3>
        <p className="showcase-note">
          <code>minDate</code> / <code>maxDate</code> — window from 7 days ago to
          14 days ahead.
        </p>
        <DateTime
          inline
          mode="date"
          asString={false}
          value={bounded}
          onChange={(next) => setBounded(next instanceof Date ? next : null)}
          minDate={minDate}
          maxDate={maxDate}
        />
        <pre className="stage-value">{previewValue(bounded)}</pre>
      </div>

      <div className="showcase-block">
        <h3>Time only · TimeValue</h3>
        <p className="showcase-note">
          Popover — adjust time, then press <strong>OK</strong> to commit.
        </p>
        <DateTimeInput
          mode="time"
          asString={false}
          onChange={(next) =>
            setTimeOnly(
              next && typeof next === "object" && !(next instanceof Date)
                ? next
                : null
            )
          }
          placeholder="Open time picker"
        />
        <pre className="stage-value">{previewValue(timeOnly)}</pre>
      </div>

      <div className="showcase-block">
        <h3>Time · no seconds</h3>
        <p className="showcase-note">
          Popover without seconds — confirm with <strong>OK</strong>.
        </p>
        <DateTimeInput
          mode="time"
          asString={false}
          showSeconds={false}
          onChange={(next) =>
            setTimeNoSeconds(
              next && typeof next === "object" && !(next instanceof Date)
                ? next
                : null
            )
          }
          placeholder="Open time picker"
        />
        <pre className="stage-value">{previewValue(timeNoSeconds)}</pre>
      </div>

      <div className="showcase-block">
        <h3>Combined date &amp; time · Date</h3>
        <p className="showcase-note">
          Datetime popover — day + time draft until <strong>OK</strong>.
        </p>
        <DateTimeInput
          mode="datetime"
          layout="combined"
          asString={false}
          value={combined}
          onChange={(next) => setCombined(next instanceof Date ? next : null)}
          placeholder="Open datetime picker"
        />
        <pre className="stage-value">{previewValue(combined)}</pre>
      </div>

      <div className="showcase-block">
        <h3>Separate view (tabs) · Date</h3>
        <p className="showcase-note">
          Tabs layout popover — confirm with <strong>OK</strong>.
        </p>
        <DateTimeInput
          mode="datetime"
          layout="tabs"
          asString={false}
          value={tabsValue}
          onChange={(next) => setTabsValue(next instanceof Date ? next : null)}
          placeholder="Open tabs datetime"
        />
        <pre className="stage-value">{previewValue(tabsValue)}</pre>
      </div>

      <div className="showcase-block">
        <h3>Input · string (asString)</h3>
        <p className="showcase-note">
          Datetime input — commit with <strong>OK</strong> (not on day click alone).
        </p>
        <DateTimeInput
          asString
          mode="datetime"
          use12Hours
          value={dateTimeInput}
          onChange={(next) => setDateTimeInput(typeof next === "string" ? next : null)}
          placeholder="Pick a date & time — confirm with OK"
        />
        <p className="stage-value">Selected: {dateTimeInput ?? "null"}</p>
      </div>

      <div className="showcase-block">
        <h3>Input · booking window</h3>
        <p className="showcase-note">
          Popover with past disabled and a 30-day <code>maxDate</code>.
        </p>
        <DateTimeInput
          asString
          mode="date"
          value={bookingInput}
          onChange={(next) =>
            setBookingInput(typeof next === "string" ? next : null)
          }
          disablePastDates
          maxDate={bookingMax}
          placeholder="Today → +30 days"
        />
        <p className="stage-value">Selected: {bookingInput ?? "null"}</p>
      </div>

      <div className="showcase-block">
        <h3>Date range · past disabled</h3>
        <p className="showcase-note">
          Range picker with <code>disablePastDates</code>.
        </p>
        <DateTimeRange
          inline
          asString={false}
          disablePastDates
          onChange={(next) =>
            setRange({
              start: next.start instanceof Date ? next.start : null,
              end: next.end instanceof Date ? next.end : null,
            })
          }
        />
        <pre className="stage-value range-value" style={{ whiteSpace: "pre-wrap" }}>
          {previewValue(range.start)} → {previewValue(range.end)}
        </pre>
      </div>

      <div className="showcase-block">
        <h3>French locale · week starts Monday</h3>
        <DateTime
          inline
          mode="date"
          asString={false}
          locale="fr"
          weekStartsOn={1}
          value={localeValue}
          onChange={(next) => setLocaleValue(next instanceof Date ? next : null)}
        />
        <pre className="stage-value">{previewValue(localeValue)}</pre>
      </div>

      <div className="showcase-block showcase-block--dark" data-ctp-theme="dark">
        <h3>Dark theme · date &amp; time popover</h3>
        <DateTime
          inline
          mode="date"
          asString={false}
          value={darkDate}
          onChange={(next) => setDarkDate(next instanceof Date ? next : null)}
        />
        <DateTimeInput
          asString
          mode="time"
          use12Hours
          value={darkInput}
          onChange={(next) => setDarkInput(typeof next === "string" ? next : null)}
          defaultOpen={false}
          placeholder="Pick a time (opens on click)"
        />
        <pre className="stage-value">
          Date: {previewValue(darkDate)}
          {"\n"}Time: {darkInput ?? "null"}
        </pre>
      </div>
    </div>
  );
}

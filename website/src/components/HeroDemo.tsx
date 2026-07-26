import { useState } from "react";
import { DateTimeInput } from "react-calendar-time";

export default function HeroDemo() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <div className="hero-stage" id="live-demo">
      <div className="stage-glow" aria-hidden="true" />
      <div className="stage-panel">
        <h2 className="stage-label">Live date-time input demo</h2>
        <DateTimeInput
          asString={false}
          value={value}
          onChange={(next) => setValue(next instanceof Date ? next : null)}
          placeholder="Pick a date & time"
          use12Hours
        />
        <p className="stage-value">
          Selected: <span>{value ? value.toString() : "null"}</span>
        </p>
      </div>
    </div>
  );
}

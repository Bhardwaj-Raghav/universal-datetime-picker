<script lang="ts">
  import "universal-datetime-picker/svelte";
  import "universal-datetime-picker/style.css";

  let date: Date | null = null;
  let input: Date | null = null;
  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;

  function preview(value: unknown): string {
    if (value == null) return "null";
    if (value instanceof Date) return value.toString();
    return String(value);
  }

  function onDateChange(e: CustomEvent) {
    const next = e.detail;
    date = next instanceof Date ? next : null;
  }

  function onInputChange(e: CustomEvent) {
    const next = e.detail;
    input = next instanceof Date ? next : null;
  }

  function onRangeChange(e: CustomEvent) {
    const next = e.detail as { start: Date | null; end: Date | null };
    rangeStart = next.start instanceof Date ? next.start : null;
    rangeEnd = next.end instanceof Date ? next.end : null;
  }
</script>

<div class="demo-trio">
  <div class="demo-trio-block showcase-block">
    <h3>Inline date · Date object</h3>
    <datetime-picker
      inline
      mode="date"
      as-string="false"
      onchange={onDateChange}
    />
    <pre class="demo-value">{preview(date)}</pre>
  </div>

  <div class="demo-trio-block showcase-block">
    <h3>Popover datetime input</h3>
    <datetime-picker-input
      mode="datetime"
      as-string="false"
      use12hours
      placeholder="Pick date & time"
      onchange={onInputChange}
    />
    <pre class="demo-value">{preview(input)}</pre>
  </div>

  <div class="demo-trio-block showcase-block">
    <h3>Date range</h3>
    <datetime-picker-range
      inline
      as-string="false"
      onchange={onRangeChange}
    />
    <pre class="demo-value">
      {preview(rangeStart)} → {preview(rangeEnd)}
    </pre>
  </div>
</div>

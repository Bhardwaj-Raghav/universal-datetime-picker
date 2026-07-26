<script setup lang="ts">
import { ref } from "vue";
import "universal-datetime-picker/vue";
import "universal-datetime-picker/style.css";

const date = ref<Date | null>(null);
const input = ref<Date | null>(null);
const rangeStart = ref<Date | null>(null);
const rangeEnd = ref<Date | null>(null);

function preview(value: unknown): string {
  if (value == null) return "null";
  if (value instanceof Date) return value.toString();
  return String(value);
}

function onDateChange(e: Event) {
  const next = (e as CustomEvent).detail;
  date.value = next instanceof Date ? next : null;
}

function onInputChange(e: Event) {
  const next = (e as CustomEvent).detail;
  input.value = next instanceof Date ? next : null;
}

function onRangeChange(e: Event) {
  const next = (e as CustomEvent).detail as {
    start: Date | null;
    end: Date | null;
  };
  rangeStart.value = next.start instanceof Date ? next.start : null;
  rangeEnd.value = next.end instanceof Date ? next.end : null;
}
</script>

<template>
  <div class="demo-trio">
    <div class="demo-trio-block showcase-block">
      <h3>Inline date · Date object</h3>
      <datetime-picker
        inline
        mode="date"
        as-string="false"
        @change="onDateChange"
      />
      <pre class="demo-value">{{ preview(date) }}</pre>
    </div>

    <div class="demo-trio-block showcase-block">
      <h3>Popover datetime input</h3>
      <datetime-picker-input
        mode="datetime"
        as-string="false"
        use12hours
        placeholder="Pick date & time"
        @change="onInputChange"
      />
      <pre class="demo-value">{{ preview(input) }}</pre>
    </div>

    <div class="demo-trio-block showcase-block">
      <h3>Date range</h3>
      <datetime-picker-range inline as-string="false" @change="onRangeChange" />
      <pre class="demo-value">
        {{ preview(rangeStart) }} → {{ preview(rangeEnd) }}
      </pre>
    </div>
  </div>
</template>

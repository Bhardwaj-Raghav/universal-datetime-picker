import { defineCustomElements } from "../wc";

/**
 * Call once (e.g. in AppModule or main.ts) and add CUSTOM_ELEMENTS_SCHEMA
 * so Angular templates can use <datetime-picker>, <datetime-picker-input>,
 * and <datetime-picker-range>.
 */
export function registerDateTimePickerElements(): void {
  defineCustomElements();
}

/** @deprecated Use registerDateTimePickerElements */
export function registerCalendarTimeElements(): void {
  registerDateTimePickerElements();
}

export { defineCustomElements } from "../wc";

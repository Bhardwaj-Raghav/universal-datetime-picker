import { defineCustomElements } from "../wc";

/**
 * Call once (e.g. in `AppModule` or `main.ts`) and add `CUSTOM_ELEMENTS_SCHEMA`
 * so Angular templates can use `<datetime-picker>`, `<datetime-picker-input>`,
 * and `<datetime-picker-range>`.
 *
 * @example
 * ```ts
 * import { registerDateTimePickerElements } from "universal-datetime-picker/angular";
 * import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
 *
 * registerDateTimePickerElements();
 * // @NgModule({ schemas: [CUSTOM_ELEMENTS_SCHEMA], ... })
 * ```
 */
export function registerDateTimePickerElements(): void {
  defineCustomElements();
}

/** @deprecated Use {@link registerDateTimePickerElements} */
export function registerCalendarTimeElements(): void {
  registerDateTimePickerElements();
}

export { defineCustomElements } from "../wc";

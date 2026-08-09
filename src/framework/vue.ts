import { defineCustomElements } from "../wc";

defineCustomElements();

/**
 * Ensure custom elements are registered (idempotent).
 * Importing this module also registers them as a side effect.
 *
 * @example
 * ```ts
 * import { register } from "universal-datetime-picker/vue";
 * register();
 * // then use <datetime-picker>, <datetime-picker-input>, <datetime-picker-range>
 * ```
 */
export function register(): void {
  defineCustomElements();
}

export { defineCustomElements } from "../wc";

import { defineCustomElements } from "../wc";

defineCustomElements();

/**
 * Svelte action that ensures custom elements are defined (idempotent).
 * Importing this module also registers them as a side effect.
 *
 * @example
 * ```svelte
 * <script>
 *   import { calendarTime } from "universal-datetime-picker/svelte";
 * </script>
 * <div use:calendarTime>
 *   <datetime-picker-input></datetime-picker-input>
 * </div>
 * ```
 */
export function calendarTime(
  _node: HTMLElement
): { destroy?: () => void } {
  defineCustomElements();
  return {};
}

export { defineCustomElements } from "../wc";

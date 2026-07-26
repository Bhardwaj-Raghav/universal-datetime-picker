import { defineCustomElements } from "../wc";

defineCustomElements();

/** Svelte action: mounts nothing; ensures custom elements are defined. */
export function calendarTime(
  _node: HTMLElement
): { destroy?: () => void } {
  defineCustomElements();
  return {};
}

export { defineCustomElements } from "../wc";

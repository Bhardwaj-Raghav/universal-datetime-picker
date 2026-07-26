import { defineCustomElements } from "../wc";

defineCustomElements();

/** Ensure custom elements are registered (idempotent). */
export function register(): void {
  defineCustomElements();
}

export { defineCustomElements } from "../wc";

import { describe, expect, it } from "vitest";
import {
  registerCalendarTimeElements,
  registerDateTimePickerElements,
} from "../src/framework/angular";
import { register as registerVueElements } from "../src/framework/vue";
import { calendarTime } from "../src/framework/svelte";
import { ensureStylesheet } from "../src/wc";

describe("framework entry points", () => {
  it("angular registerDateTimePickerElements registers custom elements", () => {
    expect(() => registerDateTimePickerElements()).not.toThrow();
    expect(customElements.get("datetime-picker")).toBeTruthy();
    expect(customElements.get("datetime-picker-input")).toBeTruthy();
    expect(customElements.get("datetime-picker-range")).toBeTruthy();
  });

  it("angular registerCalendarTimeElements deprecated alias still works", () => {
    expect(() => registerCalendarTimeElements()).not.toThrow();
  });

  it("vue register() is idempotent", () => {
    expect(() => registerVueElements()).not.toThrow();
    expect(customElements.get("datetime-picker")).toBeTruthy();
  });

  it("svelte calendarTime action ensures elements are defined", () => {
    const host = document.createElement("div");
    expect(() => calendarTime(host)).not.toThrow();
    expect(customElements.get("datetime-picker")).toBeTruthy();
  });

  it("ensureStylesheet injects the package stylesheet link once", () => {
    document.getElementById("universal-datetime-picker-styles")?.remove();
    ensureStylesheet("https://example.test/style.css");
    const link = document.getElementById("universal-datetime-picker-styles");
    expect(link).toBeTruthy();
    expect(link?.getAttribute("href")).toBe("https://example.test/style.css");
    ensureStylesheet("https://example.test/other.css");
    expect(
      document.querySelectorAll("#universal-datetime-picker-styles").length
    ).toBe(1);
  });
});

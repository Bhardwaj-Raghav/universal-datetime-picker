import { afterEach, describe, expect, it, vi } from "vitest";
import { dayjs } from "../src/utils/date";
import { createDateTimePicker } from "../src/vanilla/renderer";
import { createDateTimeRangePicker } from "../src/vanilla/rangeRenderer";
import { defineCustomElements } from "../src/wc";

function clickOk(root: ParentNode): void {
  const ok = Array.from(root.querySelectorAll("button")).find(
    (b) => b.textContent === "OK" && !(b as HTMLButtonElement).disabled
  );
  expect(ok).toBeTruthy();
  ok?.click();
}

function clickDay(root: ParentNode, labelIncludes: string): void {
  const cell = Array.from(root.querySelectorAll('[role="gridcell"]')).find(
    (node) => node.getAttribute("aria-label")?.includes(labelIncludes)
  );
  expect(cell).toBeTruthy();
  (cell as HTMLButtonElement).click();
}

function removePickerPortals(): void {
  document
    .querySelectorAll(".ctp-calendar-time-picker-absolute-container")
    .forEach((node) => node.remove());
  document.querySelectorAll(".ctp-calendar-time-picker").forEach((node) => {
    if (node.parentElement === document.body) {
      node.remove();
    }
  });
}

afterEach(() => {
  removePickerPortals();
});

describe("createDateTimePicker", () => {
  it("mounts an inline picker and confirms a value", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const onChange = vi.fn();

    const handle = createDateTimePicker(root, {
      inline: true,
      mode: "date",
      asString: true,
      onChange,
    });

    expect(root.querySelector(".ctp-calendar-time-picker")).toBeTruthy();
    expect(root.querySelector(".ctp-cancel")).toBeNull();

    clickOk(root);
    expect(onChange).toHaveBeenCalled();
    expect(typeof onChange.mock.calls[0]?.[0]).toBe("string");

    handle.destroy();
    root.remove();
  });

  it("returns a Date when asString is false", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const onChange = vi.fn();

    const handle = createDateTimePicker(root, {
      inline: true,
      mode: "date",
      asString: false,
      onChange,
    });

    clickOk(root);
    expect(onChange.mock.calls[0]?.[0]).toBeInstanceOf(Date);

    handle.destroy();
    root.remove();
  });

  it("update() can close an overlay picker", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const handle = createDateTimePicker(root, {
      mode: "date",
      open: true,
      inline: false,
    });

    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    handle.update({ open: false });
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    handle.destroy();
    root.remove();
  });
});

describe("createDateTimeRangePicker", () => {
  it("mounts an inline range picker and confirms", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const onChange = vi.fn();

    const handle = createDateTimeRangePicker(root, {
      inline: true,
      asString: true,
      defaultValue: {
        start: dayjs("2024-07-10"),
        end: null,
      },
      onChange,
    });

    expect(root.querySelector(".ctp-calendar-time-picker")).toBeTruthy();
    clickDay(root, "July 20, 2024");
    clickOk(root);
    expect(onChange).toHaveBeenCalledWith({
      start: "2024-07-10",
      end: "2024-07-20",
    });

    handle.destroy();
    root.remove();
  });
});

describe("web components", () => {
  it("defines custom elements and emits change", async () => {
    defineCustomElements();
    expect(customElements.get("datetime-picker")).toBeTruthy();

    const el = document.createElement("datetime-picker") as HTMLElement & {
      addEventListener: HTMLElement["addEventListener"];
    };
    el.setAttribute("inline", "");
    el.setAttribute("mode", "date");
    el.setAttribute("as-string", "true");
    document.body.append(el);

    await customElements.whenDefined("datetime-picker");
    await Promise.resolve();

    const onChange = vi.fn();
    el.addEventListener("change", (event) => {
      onChange((event as CustomEvent).detail);
    });

    clickOk(el);
    expect(onChange).toHaveBeenCalled();

    el.remove();
  });

  it("datetime-picker-input opens on click and emits change", async () => {
    defineCustomElements();

    const el = document.createElement("datetime-picker-input");
    el.setAttribute("mode", "date");
    el.setAttribute("as-string", "true");
    document.body.append(el);

    await customElements.whenDefined("datetime-picker-input");
    await Promise.resolve();

    const onChange = vi.fn();
    el.addEventListener("change", (event) => {
      onChange((event as CustomEvent).detail);
    });

    const input = el.querySelector("input.ctp-input");
    expect(input).toBeTruthy();
    (input as HTMLInputElement).click();
    await Promise.resolve();

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    clickOk(dialog!);
    expect(onChange).toHaveBeenCalled();
    expect(typeof onChange.mock.calls[0]?.[0]).toBe("string");

    el.remove();
  });

  it("datetime-picker-range inline emits change on confirm", async () => {
    defineCustomElements();

    const el = document.createElement("datetime-picker-range");
    el.setAttribute("inline", "");
    el.setAttribute("as-string", "true");
    el.setAttribute("value-start", "2024-07-10");
    document.body.append(el);

    await customElements.whenDefined("datetime-picker-range");
    await Promise.resolve();

    const onChange = vi.fn();
    el.addEventListener("change", (event) => {
      onChange((event as CustomEvent).detail);
    });

    clickDay(el, "July 20, 2024");
    clickOk(el);
    expect(onChange).toHaveBeenCalledWith({
      start: "2024-07-10",
      end: "2024-07-20",
    });

    el.remove();
  });

  it("remains closed after dismiss when non-inline with open attribute", async () => {
    defineCustomElements();

    const el = document.createElement("datetime-picker");
    el.setAttribute("open", "");
    el.setAttribute("mode", "date");
    document.body.append(el);

    await customElements.whenDefined("datetime-picker");
    await Promise.resolve();

    expect(el.hasAttribute("open")).toBe(true);
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();

    const backdrop = document.querySelector(
      ".ctp-calendar-time-picker-absolute-container"
    );
    expect(backdrop).toBeTruthy();
    const close = backdrop?.querySelector(".ctp-cancel");
    expect(close).toBeTruthy();
    (close as HTMLButtonElement).click();
    await Promise.resolve();

    expect(el.hasAttribute("open")).toBe(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    el.remove();
  });

  it("registers prefixed tags after default defineCustomElements (CDN/vue import)", () => {
    defineCustomElements();
    expect(() => defineCustomElements({ prefix: "app" })).not.toThrow();
    expect(customElements.get("app-datetime-picker")).toBeTruthy();
    expect(customElements.get("app-datetime-picker-input")).toBeTruthy();
    expect(customElements.get("app-datetime-picker-range")).toBeTruthy();
  });

  it("prefixed datetime-picker mounts inline and emits change", async () => {
    defineCustomElements({ prefix: "demo" });

    const el = document.createElement("demo-datetime-picker");
    el.setAttribute("inline", "");
    el.setAttribute("mode", "date");
    el.setAttribute("as-string", "true");
    document.body.append(el);

    await customElements.whenDefined("demo-datetime-picker");
    await Promise.resolve();

    const onChange = vi.fn();
    el.addEventListener("change", (event) => {
      onChange((event as CustomEvent).detail);
    });

    clickOk(el);
    expect(onChange).toHaveBeenCalled();

    el.remove();
  });
});

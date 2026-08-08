import {
  createDateTimePicker,
  type DateTimePickerHandle,
} from "../vanilla/renderer";
import {
  createDateTimeRangePicker,
  type DateTimeRangePickerHandle,
} from "../vanilla/rangeRenderer";
import type {
  DateTimeChangeValue,
  DateRangeValue,
  DateTimeMode,
  DateTimeLayout,
} from "../core/types";
import {
  dayjs,
  formatValue,
  parseValue,
  resolveFormat,
} from "../core/logic/date";

function boolAttr(el: HTMLElement, name: string, fallback = false): boolean {
  if (!el.hasAttribute(name)) {
    return fallback;
  }
  const v = el.getAttribute(name);
  return v === "" || v === "true" || v === name;
}

function parseAsString(el: HTMLElement): boolean | undefined {
  if (!el.hasAttribute("as-string")) {
    return undefined;
  }
  return boolAttr(el, "as-string", true);
}

/** Non-inline overlay: absent `open` attribute means closed (not defaultOpen). */
function resolveControlledOpen(inline: boolean, el: HTMLElement): boolean {
  if (inline) {
    return true;
  }
  if (!el.hasAttribute("open")) {
    return false;
  }
  return boolAttr(el, "open");
}

function syncOpenAttribute(el: HTMLElement, isOpen: boolean): void {
  if (isOpen) {
    el.setAttribute("open", "");
  } else {
    el.removeAttribute("open");
  }
}

const STYLE_LINK_ID = "universal-datetime-picker-styles";

/** Ensure the shared stylesheet is in the document (light DOM). */
export function ensureStylesheet(href?: string): void {
  if (typeof document === "undefined") {
    return;
  }
  if (document.getElementById(STYLE_LINK_ID)) {
    return;
  }
  const link = document.createElement("link");
  link.id = STYLE_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    href ??
    "https://cdn.jsdelivr.net/npm/universal-datetime-picker/dist/style.css";
  document.head.append(link);
}

abstract class BaseCalendarElement extends HTMLElement {
  protected handle: DateTimePickerHandle | DateTimeRangePickerHandle | null =
    null;
  protected mountEl: HTMLDivElement | null = null;

  connectedCallback(): void {
    if (!this.mountEl) {
      this.mountEl = document.createElement("div");
      this.append(this.mountEl);
    }
    this.mount();
  }

  disconnectedCallback(): void {
    this.handle?.destroy();
    this.handle = null;
  }

  protected abstract mount(): void;

  protected emitChange(detail: unknown): void {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }
}

export class DateTimePickerElement extends BaseCalendarElement {
  static get observedAttributes(): string[] {
    return [
      "mode",
      "layout",
      "inline",
      "open",
      "use12hours",
      "show-seconds",
      "as-string",
      "locale",
      "format",
      "theme",
      "value",
      "popover",
    ];
  }

  attributeChangedCallback(): void {
    if (this.isConnected) {
      this.mount();
    }
  }

  get value(): DateTimeChangeValue {
    return (this as unknown as { _value?: DateTimeChangeValue })._value ?? null;
  }

  set value(next: DateTimeChangeValue) {
    (this as unknown as { _value?: DateTimeChangeValue })._value = next;
    if (this.isConnected) {
      this.mount();
    }
  }

  protected mount(): void {
    if (!this.mountEl) {
      return;
    }

    const mode = (this.getAttribute("mode") as DateTimeMode) || "datetime";
    const layout = (this.getAttribute("layout") as DateTimeLayout) || "combined";
    const showSeconds = !this.hasAttribute("show-seconds")
      ? true
      : boolAttr(this, "show-seconds", true);
    const use12Hours = boolAttr(this, "use12hours");
    const inline = boolAttr(this, "inline");
    const popover = boolAttr(this, "popover");
    const asString = parseAsString(this);
    const format = this.getAttribute("format") || undefined;
    const locale = this.getAttribute("locale") || "en";
    const theme = (this.getAttribute("theme") as "light" | "dark") || undefined;
    const open = resolveControlledOpen(inline, this);

    const attrValue = this.getAttribute("value");
    const propValue = (this as unknown as { _value?: DateTimeChangeValue })
      ._value;
    const value =
      propValue !== undefined
        ? propValue
        : attrValue != null
          ? attrValue
          : undefined;

    const partial = {
      mode,
      layout,
      showSeconds,
      use12Hours,
      inline,
      popover,
      asString,
      format,
      locale,
      theme,
      open,
      value: value === undefined ? undefined : (value as string | Date | null),
      onChange: (next: DateTimeChangeValue) => {
        (this as unknown as { _value?: DateTimeChangeValue })._value = next;
        this.emitChange(next);
      },
      onOpenChange: (isOpen: boolean) => {
        syncOpenAttribute(this, isOpen);
        this.dispatchEvent(
          new CustomEvent("openchange", {
            detail: isOpen,
            bubbles: true,
            composed: true,
          })
        );
      },
    };

    if (this.handle) {
      (this.handle as DateTimePickerHandle).update(partial);
      return;
    }

    this.mountEl.replaceChildren();
    this.handle = createDateTimePicker(this.mountEl, partial);
  }
}

export class DateTimePickerInputElement extends HTMLElement {
  private handle: DateTimePickerHandle | null = null;
  private input: HTMLInputElement | null = null;
  private iconBtn: HTMLButtonElement | null = null;
  private root: HTMLDivElement | null = null;

  static get observedAttributes(): string[] {
    return [
      "mode",
      "placeholder",
      "disabled",
      "use12hours",
      "show-seconds",
      "as-string",
      "locale",
      "format",
      "value",
      "theme",
    ];
  }

  connectedCallback(): void {
    if (!this.root) {
      this.root = document.createElement("div");
      this.root.className = "ctp-input-root";
      const field = document.createElement("div");
      field.className = "ctp-input-field";
      this.input = document.createElement("input");
      this.input.className = "ctp-input ctp-input-with-icon";
      this.iconBtn = document.createElement("button");
      this.iconBtn.type = "button";
      this.iconBtn.className = "ctp-input-icon-btn";
      this.iconBtn.tabIndex = -1;
      this.iconBtn.innerHTML =
        '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
      field.append(this.input, this.iconBtn);
      this.root.append(field);
      this.append(this.root);
    }
    this.sync();
  }

  disconnectedCallback(): void {
    this.handle?.destroy();
    this.handle = null;
  }

  attributeChangedCallback(): void {
    if (this.isConnected) {
      this.sync();
    }
  }

  private sync(): void {
    if (!this.input || !this.root) {
      return;
    }

    const mode = (this.getAttribute("mode") as DateTimeMode) || "datetime";
    const showSeconds = !this.hasAttribute("show-seconds")
      ? true
      : boolAttr(this, "show-seconds", true);
    const use12Hours = boolAttr(this, "use12hours");
    const asString = parseAsString(this);
    const formatAttr = this.getAttribute("format") || undefined;
    const resolvedFormat = resolveFormat({
      mode,
      format: formatAttr,
      use12Hours,
      showSeconds,
    });
    const placeholder =
      this.getAttribute("placeholder") || "Select date and time";
    const disabled = boolAttr(this, "disabled");
    const locale = this.getAttribute("locale") || "en";
    const theme = (this.getAttribute("theme") as "light" | "dark") || undefined;
    const attrValue = this.getAttribute("value");

    this.input.placeholder = placeholder;
    this.input.disabled = disabled;
    this.input.readOnly = true;
    this.input.setAttribute("aria-haspopup", "dialog");
    this.input.setAttribute("aria-label", placeholder);
    if (this.iconBtn) {
      this.iconBtn.disabled = disabled;
      this.iconBtn.setAttribute("aria-label", placeholder);
    }

    const display = attrValue
      ? formatValue(parseValue(attrValue, resolvedFormat), resolvedFormat) ??
        attrValue
      : "";
    this.input.value = display;

    if (this.handle) {
      this.handle.update({
        mode,
        showSeconds,
        use12Hours,
        asString,
        format: formatAttr,
        locale,
        theme,
        value: attrValue,
      });
    }

    const openPicker = () => {
      if (disabled) {
        return;
      }
      if (this.handle) {
        this.handle.update({ open: true, value: attrValue });
        return;
      }
      this.handle = createDateTimePicker(this.root!, {
        mode,
        showSeconds,
        use12Hours,
        asString,
        format: formatAttr,
        locale,
        theme,
        popover: true,
        anchorEl: this.input,
        open: true,
        value: attrValue,
        onChange: (next) => {
          let text = "";
          if (next === null) {
            text = "";
          } else if (typeof next === "string") {
            text = next;
          } else if (next instanceof Date) {
            text = formatValue(dayjs(next), resolvedFormat) ?? "";
          } else {
            text = next.formatted;
          }
          if (this.input) {
            this.input.value = text;
          }
          if (text) {
            this.setAttribute("value", text);
          } else {
            this.removeAttribute("value");
          }
          this.dispatchEvent(
            new CustomEvent("change", {
              detail: next,
              bubbles: true,
              composed: true,
            })
          );
        },
        onOpenChange: (isOpen) => {
          this.input?.setAttribute("aria-expanded", String(isOpen));
          if (!isOpen) {
            this.handle?.destroy();
            this.handle = null;
          }
        },
      });
    };

    this.input.onclick = openPicker;
    if (this.iconBtn) {
      this.iconBtn.onclick = openPicker;
    }
    this.input.onkeydown = (event) => {
      if (disabled) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPicker();
      }
    };
  }
}

export class DateTimePickerRangeElement extends BaseCalendarElement {
  static get observedAttributes(): string[] {
    return [
      "inline",
      "open",
      "as-string",
      "locale",
      "format",
      "value-start",
      "value-end",
    ];
  }

  attributeChangedCallback(): void {
    if (this.isConnected) {
      this.mount();
    }
  }

  protected mount(): void {
    if (!this.mountEl) {
      return;
    }

    const inline = boolAttr(this, "inline");
    const asString = parseAsString(this);
    const format = this.getAttribute("format") || undefined;
    const locale = this.getAttribute("locale") || "en";
    const open = resolveControlledOpen(inline, this);
    const start = this.getAttribute("value-start");
    const end = this.getAttribute("value-end");

    const partial = {
      inline,
      asString,
      format,
      locale,
      open,
      value:
        start || end
          ? { start: start ?? null, end: end ?? null }
          : undefined,
      onChange: (next: DateRangeValue) => {
        if (typeof next.start === "string" || next.start === null) {
          if (next.start) {
            this.setAttribute("value-start", next.start);
          } else {
            this.removeAttribute("value-start");
          }
        }
        if (typeof next.end === "string" || next.end === null) {
          if (next.end) {
            this.setAttribute("value-end", next.end);
          } else {
            this.removeAttribute("value-end");
          }
        }
        this.emitChange(next);
      },
      onOpenChange: (isOpen: boolean) => {
        syncOpenAttribute(this, isOpen);
        this.dispatchEvent(
          new CustomEvent("openchange", {
            detail: isOpen,
            bubbles: true,
            composed: true,
          })
        );
      },
    };

    if (this.handle) {
      (this.handle as DateTimeRangePickerHandle).update(partial);
      return;
    }

    this.mountEl.replaceChildren();
    this.handle = createDateTimeRangePicker(this.mountEl, partial);
  }
}

let defaultTagsDefined = false;

export type DefineCustomElementsOptions = {
  /** Prefix for tag names, e.g. `my` -> `<my-datetime-picker>`. */
  prefix?: string;
};

function resolveTag(base: string, prefix?: string): string {
  const p = prefix?.trim();
  if (!p) {
    return base;
  }
  return `${p}-${base}`;
}

function defineElementTag(
  tag: string,
  Base: CustomElementConstructor,
  useUniqueConstructor: boolean
): void {
  if (customElements.get(tag)) {
    return;
  }
  const ctor = useUniqueConstructor
    ? class extends (Base as typeof HTMLElement) {}
    : Base;
  customElements.define(tag, ctor as CustomElementConstructor);
}

export function defineCustomElements(
  options?: DefineCustomElementsOptions
): void {
  if (typeof customElements === "undefined") {
    return;
  }
  const prefix = options?.prefix?.trim();
  const useUniqueConstructor = Boolean(prefix);
  const pickerTag = resolveTag("datetime-picker", prefix);
  const inputTag = resolveTag("datetime-picker-input", prefix);
  const rangeTag = resolveTag("datetime-picker-range", prefix);

  if (!prefix) {
    if (defaultTagsDefined) {
      return;
    }
    defaultTagsDefined = true;
  }

  defineElementTag(pickerTag, DateTimePickerElement, useUniqueConstructor);
  defineElementTag(inputTag, DateTimePickerInputElement, useUniqueConstructor);
  defineElementTag(rangeTag, DateTimePickerRangeElement, useUniqueConstructor);
}

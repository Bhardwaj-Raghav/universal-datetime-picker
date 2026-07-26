import {
  createDateTimePicker,
  createDateTimeRangePicker,
  type DateTimePickerHandle,
  type DateTimeRangePickerHandle,
} from "universal-datetime-picker/vanilla";
import { defineCustomElements } from "universal-datetime-picker/wc";
import { CDN_CSS, CDN_JS } from "../site.config";

type PreviewEl = HTMLElement;

function setPreview(el: PreviewEl | null, value: unknown): void {
  if (!el) return;
  if (value === null || value === undefined) {
    el.textContent = "null";
    return;
  }
  if (typeof value === "string") {
    el.textContent = value;
    return;
  }
  if (value instanceof Date) {
    el.textContent = value.toString();
    return;
  }
  el.textContent = JSON.stringify(value, null, 2);
}

function mountVanillaTrio(container: HTMLElement): () => void {
  const handles: Array<DateTimePickerHandle | DateTimeRangePickerHandle> = [];

  const dateRoot = container.querySelector<HTMLElement>("[data-demo-date]");
  const dateOut = container.querySelector<PreviewEl>("[data-demo-date-out]");
  if (dateRoot) {
    handles.push(
      createDateTimePicker(dateRoot, {
        inline: true,
        mode: "date",
        asString: false,
        onChange: (v) => setPreview(dateOut, v),
      })
    );
  }

  const inputRoot = container.querySelector<HTMLElement>("[data-demo-input]");
  const inputOut = container.querySelector<PreviewEl>("[data-demo-input-out]");
  if (inputRoot) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-ghost";
    btn.textContent = "Open datetime picker";
    inputRoot.append(btn);
    let popHandle: DateTimePickerHandle | null = null;
    btn.addEventListener("click", () => {
      popHandle?.destroy();
      popHandle = createDateTimePicker(inputRoot, {
        mode: "datetime",
        asString: false,
        use12Hours: true,
        popover: true,
        anchorEl: btn,
        open: true,
        onChange: (v) => setPreview(inputOut, v),
        onOpenChange: (open) => {
          if (!open) {
            popHandle?.destroy();
            popHandle = null;
          }
        },
      });
    });
    handles.push({
      destroy: () => popHandle?.destroy(),
      update: () => {},
      getController: () => popHandle!.getController(),
    } as DateTimePickerHandle);
  }

  const rangeRoot = container.querySelector<HTMLElement>("[data-demo-range]");
  const rangeOut = container.querySelector<PreviewEl>("[data-demo-range-out]");
  if (rangeRoot) {
    handles.push(
      createDateTimeRangePicker(rangeRoot, {
        inline: true,
        asString: false,
        onChange: (v) => {
          if (rangeOut) {
            rangeOut.textContent = `${v.start instanceof Date ? v.start.toString() : "null"} → ${v.end instanceof Date ? v.end.toString() : "null"}`;
          }
        },
      })
    );
  }

  return () => handles.forEach((h) => h.destroy());
}

function mountWcTrio(container: HTMLElement): () => void {
  defineCustomElements();

  const dateEl = container.querySelector("datetime-picker[data-demo-date]");
  const dateOut = container.querySelector<PreviewEl>("[data-demo-date-out]");
  dateEl?.addEventListener("change", (e) =>
    setPreview(dateOut, (e as CustomEvent).detail)
  );

  const inputEl = container.querySelector("datetime-picker-input[data-demo-input]");
  const inputOut = container.querySelector<PreviewEl>("[data-demo-input-out]");
  inputEl?.addEventListener("change", (e) =>
    setPreview(inputOut, (e as CustomEvent).detail)
  );

  const rangeEl = container.querySelector("datetime-picker-range[data-demo-range]");
  const rangeOut = container.querySelector<PreviewEl>("[data-demo-range-out]");
  rangeEl?.addEventListener("change", (e) => {
    const v = (e as CustomEvent).detail as {
      start: Date | null;
      end: Date | null;
    };
    if (rangeOut) {
      rangeOut.textContent = `${v.start instanceof Date ? v.start.toString() : "null"} → ${v.end instanceof Date ? v.end.toString() : "null"}`;
    }
  });

  return () => {};
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.append(s);
  });
}

function loadStylesheet(href: string): void {
  if (document.querySelector(`link[href="${href}"]`)) {
    return;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
}

export async function mountFrameworkDemo(
  container: HTMLElement,
  mode: "vanilla-mount" | "wc" | "cdn"
): Promise<() => void> {
  if (mode === "cdn") {
    loadStylesheet(CDN_CSS);
    await loadScript(`${CDN_JS}`);
    return mountWcTrio(container);
  }
  if (mode === "vanilla-mount") {
    return mountVanillaTrio(container);
  }
  return mountWcTrio(container);
}

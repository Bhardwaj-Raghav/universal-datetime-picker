import "dayjs/locale/en-gb";
import "dayjs/locale/en-ca";
import "dayjs/locale/fr";
import "dayjs/locale/fr-ca";
import "dayjs/locale/de";
import "dayjs/locale/es";
import "dayjs/locale/es-mx";
import "dayjs/locale/it";
import "dayjs/locale/pt-br";
import "dayjs/locale/ja";
import "dayjs/locale/ko";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";
import "dayjs/locale/nl";
import "dayjs/locale/sv";
import {
  createDateTimePicker,
  createDateTimeRangePicker,
  type DateTimePickerHandle,
  type DateTimeRangePickerHandle,
} from "universal-datetime-picker/vanilla";
import { CDN_CSS, CDN_JS } from "../site.config";

type Handle = DateTimePickerHandle | DateTimeRangePickerHandle;

type Mode = "date" | "time" | "datetime" | "range";
type Layout = "combined" | "tabs";
type Theme = "light" | "dark";
type Presentation = "inline" | "popover" | "overlay";
type SnippetFw = "react" | "vanilla" | "cdn" | "vue" | "svelte" | "angular";

export type PlayState = {
  mode: Mode;
  layout: Layout;
  presentation: Presentation;
  theme: Theme;
  asString: boolean;
  use12Hours: boolean;
  showSeconds: boolean;
  disablePast: boolean;
  disableFuture: boolean;
  weekStartsOn: number;
  locale: string;
};

function previewValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toString();
  return JSON.stringify(value, null, 2);
}

function readState(root: HTMLElement): PlayState {
  const mode =
    (root.querySelector<HTMLSelectElement>("[data-play-mode]")?.value as Mode) ||
    "datetime";
  const presentation =
    (root.querySelector<HTMLSelectElement>("[data-play-presentation]")
      ?.value as Presentation) || "inline";
  return {
    mode,
    layout:
      (root.querySelector<HTMLSelectElement>("[data-play-layout]")
        ?.value as Layout) || "combined",
    presentation,
    theme:
      (root.querySelector<HTMLSelectElement>("[data-play-theme]")
        ?.value as Theme) || "light",
    asString:
      root.querySelector<HTMLInputElement>("[data-play-as-string]")?.checked ??
      false,
    use12Hours:
      root.querySelector<HTMLInputElement>("[data-play-12h]")?.checked ?? false,
    showSeconds:
      root.querySelector<HTMLInputElement>("[data-play-seconds]")?.checked ??
      false,
    disablePast:
      root.querySelector<HTMLInputElement>("[data-play-past]")?.checked ?? false,
    disableFuture:
      root.querySelector<HTMLInputElement>("[data-play-future]")?.checked ??
      false,
    weekStartsOn: Number(
      root.querySelector<HTMLSelectElement>("[data-play-week]")?.value ?? "0",
    ),
    locale:
      root.querySelector<HTMLSelectElement>("[data-play-locale]")?.value || "en",
  };
}

function syncDisabled(root: HTMLElement, state: PlayState) {
  const layout = root.querySelector<HTMLSelectElement>("[data-play-layout]");
  if (layout) layout.disabled = state.mode !== "datetime";
  const past = root.querySelector<HTMLInputElement>("[data-play-past]");
  const future = root.querySelector<HTMLInputElement>("[data-play-future]");
  if (past) past.disabled = state.mode === "time";
  if (future) future.disabled = state.mode === "time";

  const note = root.querySelector<HTMLElement>("[data-play-presentation-note]");
  if (note) {
    if (state.presentation === "inline") {
      note.hidden = true;
      note.textContent = "";
    } else if (state.mode === "range" && state.presentation === "popover") {
      note.hidden = false;
      note.textContent =
        "DateTimeRange has no anchored popover API. This mode opens a closed overlay from the trigger.";
    } else if (state.presentation === "popover") {
      note.hidden = false;
      note.textContent =
        "Popover starts closed. Click the trigger to open; outside click or Escape closes it.";
    } else {
      note.hidden = false;
      note.textContent =
        "Overlay starts closed. Click the trigger to open the modal picker.";
    }
  }
}

function localeImportLine(locale: string): string {
  return locale !== "en" ? `import "dayjs/locale/${locale}";\n` : "";
}

function sharedOptLines(state: PlayState, forRange = false): string[] {
  const lines: string[] = [];
  if (!forRange && state.theme === "dark") lines.push(`  theme="dark"`);
  if (state.asString) lines.push(`  asString`);
  if (!forRange && state.use12Hours) lines.push(`  use12Hours`);
  if (!forRange && state.showSeconds) lines.push(`  showSeconds`);
  if (state.disablePast) lines.push(`  disablePastDates`);
  if (state.disableFuture) lines.push(`  disableFutureDates`);
  if (state.weekStartsOn !== 0)
    lines.push(`  weekStartsOn={${state.weekStartsOn}}`);
  if (state.locale !== "en") lines.push(`  locale="${state.locale}"`);
  return lines;
}

function reactSnippet(state: PlayState): string {
  const localeImport = localeImportLine(state.locale);
  const common = sharedOptLines(state);
  const rangeCommon = sharedOptLines(state, true);

  if (state.mode === "range") {
    const body = rangeCommon.length ? `${rangeCommon.join("\n")}\n` : "";
    if (state.presentation === "inline") {
      return `${localeImport}import { DateTimeRange } from "universal-datetime-picker";
import "universal-datetime-picker/style.css";

<DateTimeRange
  inline
${body}  onChange={setRange}
/>`;
    }
    return `${localeImport}import { useState } from "react";
import { DateTimeRange } from "universal-datetime-picker";
import "universal-datetime-picker/style.css";

const [open, setOpen] = useState(false);

<button type="button" onClick={() => setOpen(true)}>Pick range</button>
<DateTimeRange
  open={open}
  onOpenChange={setOpen}
  defaultOpen={false}
${body}  onChange={setRange}
/>`;
  }

  if (state.presentation === "inline") {
    return `${localeImport}import DateTime from "universal-datetime-picker";
import "universal-datetime-picker/style.css";

<DateTime
  mode="${state.mode}"
${state.mode === "datetime" ? `  layout="${state.layout}"\n` : ""}  inline
${common.join("\n")}
  onChange={setValue}
/>`;
  }

  if (state.presentation === "popover") {
    return `${localeImport}import { useState } from "react";
import { DateTimeInput } from "universal-datetime-picker";
import "universal-datetime-picker/style.css";

const [value, setValue] = useState(null);

<DateTimeInput
  mode="${state.mode}"
${state.mode === "datetime" ? `  layout="${state.layout}"\n` : ""}${common.join("\n")}
  placeholder="Pick a value"
  value={value}
  onChange={setValue}
/>`;
  }

  return `${localeImport}import { useState } from "react";
import DateTime from "universal-datetime-picker";
import "universal-datetime-picker/style.css";

const [open, setOpen] = useState(false);

<button type="button" onClick={() => setOpen(true)}>Open picker</button>
<DateTime
  mode="${state.mode}"
${state.mode === "datetime" ? `  layout="${state.layout}"\n` : ""}  open={open}
  onOpenChange={setOpen}
  defaultOpen={false}
${common.join("\n")}
  onChange={setValue}
/>`;
}

function vanillaSnippet(state: PlayState): string {
  const localeImport = localeImportLine(state.locale);
  const create =
    state.mode === "range"
      ? "createDateTimeRangePicker"
      : "createDateTimePicker";

  const isRange = state.mode === "range";
  const lines: string[] = [];
  if (!isRange) lines.push(`  mode: "${state.mode}"`);
  if (state.mode === "datetime") lines.push(`  layout: "${state.layout}"`);
  if (state.presentation === "inline") {
    lines.push(`  inline: true`);
  } else {
    lines.push(`  inline: false`);
    lines.push(`  defaultOpen: false`);
    if (state.presentation === "popover" && !isRange) {
      lines.push(`  popover: true`);
      lines.push(`  anchorEl: trigger`);
    }
  }
  if (!isRange && state.theme === "dark") lines.push(`  theme: "dark"`);
  lines.push(`  asString: ${state.asString}`);
  if (!isRange && state.use12Hours) lines.push(`  use12Hours: true`);
  if (!isRange && state.showSeconds) lines.push(`  showSeconds: true`);
  if (state.disablePast) lines.push(`  disablePastDates: true`);
  if (state.disableFuture) lines.push(`  disableFutureDates: true`);
  if (state.weekStartsOn !== 0)
    lines.push(`  weekStartsOn: ${state.weekStartsOn}`);
  if (state.locale !== "en") lines.push(`  locale: "${state.locale}"`);
  lines.push(`  onChange: (value) => console.log(value)`);
  const optionBody = lines.join(",\n");

  if (state.presentation === "inline") {
    return `${localeImport}import { ${create} } from "universal-datetime-picker/vanilla";
import "universal-datetime-picker/style.css";

const root = document.getElementById("picker");
${create}(root, {
${optionBody},
});`;
  }

  return `${localeImport}import { ${create} } from "universal-datetime-picker/vanilla";
import "universal-datetime-picker/style.css";

const stage = document.getElementById("picker");
const trigger = document.createElement("button");
trigger.type = "button";
trigger.textContent = "Open picker";
stage.appendChild(trigger);

const host = document.createElement("div");
stage.appendChild(host);

const handle = ${create}(host, {
${optionBody},
});

trigger.addEventListener("click", () => {
  handle.getController().setOpen(true);
});`;
}

function wcAttrs(state: PlayState): string {
  const parts: string[] = [];
  if (state.mode !== "range") parts.push(`mode="${state.mode}"`);
  parts.push(`as-string="${state.asString}"`);
  if (state.presentation === "inline") parts.push("inline");
  if (state.mode === "datetime") parts.push(`layout="${state.layout}"`);
  if (state.theme === "dark") parts.push(`theme="dark"`);
  if (state.use12Hours) parts.push("use-12-hours");
  if (state.showSeconds) parts.push("show-seconds");
  if (state.disablePast) parts.push("disable-past-dates");
  if (state.disableFuture) parts.push("disable-future-dates");
  if (state.weekStartsOn !== 0)
    parts.push(`week-starts-on="${state.weekStartsOn}"`);
  if (state.locale !== "en") parts.push(`locale="${state.locale}"`);
  return parts.join(" ");
}

function buildSnippet(fw: SnippetFw, state: PlayState): string {
  const isRange = state.mode === "range";
  const attrs = wcAttrs(state);
  const localeImport = localeImportLine(state.locale);
  const tag = isRange ? "datetime-picker-range" : "datetime-picker";

  if (fw === "react") return reactSnippet(state);
  if (fw === "vanilla") return vanillaSnippet(state);

  if (fw === "cdn") {
    return `<link rel="stylesheet" href="${CDN_CSS}" />
<script src="${CDN_JS}"></script>

<${tag} ${attrs}></${tag}>
<script>
  document.querySelector("${tag}").addEventListener("change", (e) => {
    console.log(e.detail);
  });
</script>`;
  }

  if (fw === "vue") {
    return `${localeImport}// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { defineCustomElements } from "universal-datetime-picker/vue";
import "universal-datetime-picker/style.css";

defineCustomElements();

createApp(App)
  .config.compilerOptions.isCustomElement = (tag) =>
    tag.startsWith("datetime-picker")
  .mount("#app");

// App.vue
<${tag} ${attrs} @change="onChange" />`;
  }

  if (fw === "svelte") {
    return `${localeImport}// +layout.ts (register once)
import { defineCustomElements } from "universal-datetime-picker/svelte";
import "universal-datetime-picker/style.css";

defineCustomElements();

// Page.svelte
<script lang="ts">
  function onChange(e: CustomEvent) {
    console.log(e.detail);
  }
</script>

<${tag} ${attrs} onchange={onChange}></${tag}>`;
  }

  return `${localeImport}// main.ts
import { registerDateTimePickerElements } from "universal-datetime-picker/angular";
import "universal-datetime-picker/style.css";

registerDateTimePickerElements();

// component template (needs CUSTOM_ELEMENTS_SCHEMA)
<${tag} ${attrs} (change)="onChange($event)"></${tag}>`;
}

const FW_LINKS: Record<SnippetFw, string> = {
  react: "/react/",
  vanilla: "/vanilla/",
  cdn: "/cdn/",
  vue: "/vue/",
  svelte: "/svelte/",
  angular: "/angular/",
};

export function initExamplesPlayground(): () => void {
  const root = document.querySelector<HTMLElement>("[data-playground]");
  if (!root) return () => {};

  let handle: Handle | null = null;
  let triggerCleanup: (() => void) | null = null;
  let activeFw: SnippetFw = "react";
  const mount = root.querySelector<HTMLElement>("[data-play-stage]");
  const valueEl = root.querySelector<HTMLElement>("[data-play-out]");
  const codeEl = root.querySelector<HTMLElement>("[data-play-snippet]");
  const fwLink = root.querySelector<HTMLAnchorElement>("[data-play-fw-link]");
  const copyBtn = root.querySelector<HTMLButtonElement>("[data-play-copy]");
  if (!mount || !valueEl || !codeEl || !fwLink) return () => {};

  const remount = () => {
    const state = readState(root);
    syncDisabled(root, state);
    triggerCleanup?.();
    triggerCleanup = null;
    handle?.destroy();
    handle = null;
    mount.replaceChildren();
    valueEl.textContent = "null";

    const onChange = (value: unknown) => {
      valueEl.textContent = previewValue(value);
    };
    const bounds = {
      asString: state.asString,
      disablePastDates: state.disablePast,
      disableFutureDates: state.disableFuture,
      weekStartsOn: state.weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      locale: state.locale,
      onChange,
    };
    const singleCommon = {
      ...bounds,
      use12Hours: state.use12Hours,
      showSeconds: state.showSeconds,
      theme: state.theme,
    };

    if (state.presentation === "inline") {
      if (state.mode === "range") {
        handle = createDateTimeRangePicker(mount, {
          ...bounds,
          inline: true,
        });
      } else {
        handle = createDateTimePicker(mount, {
          ...singleCommon,
          mode: state.mode,
          layout: state.layout,
          inline: true,
        });
      }
    } else {
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "play-trigger";
      trigger.textContent =
        state.mode === "range" ? "Pick date range" : "Open picker";

      const host = document.createElement("div");
      host.className = "play-picker-host";
      mount.append(trigger, host);

      const usePopover =
        state.presentation === "popover" && state.mode !== "range";

      if (state.mode === "range") {
        handle = createDateTimeRangePicker(host, {
          ...bounds,
          inline: false,
          open: false,
          defaultOpen: false,
        });
      } else {
        handle = createDateTimePicker(host, {
          ...singleCommon,
          mode: state.mode,
          layout: state.layout,
          inline: false,
          open: false,
          defaultOpen: false,
          popover: usePopover,
          anchorEl: usePopover ? trigger : null,
        });
      }

      const onTriggerClick = () => {
        handle?.getController().setOpen(true);
      };
      trigger.addEventListener("click", onTriggerClick);
      triggerCleanup = () => {
        trigger.removeEventListener("click", onTriggerClick);
      };
    }

    codeEl.textContent = buildSnippet(activeFw, state);
    fwLink.href = FW_LINKS[activeFw];
    const label = activeFw.charAt(0).toUpperCase() + activeFw.slice(1);
    fwLink.textContent = `Open the ${label} page →`;
  };

  const onOptionsChange = () => remount();
  root
    .querySelectorAll<HTMLElement>(
      ".playground-options select, .playground-options input",
    )
    .forEach((el) => {
      el.addEventListener("change", onOptionsChange);
    });

  const fwButtons = root.querySelectorAll<HTMLButtonElement>("[data-play-fw]");
  const onFwClick = (btn: HTMLButtonElement) => {
    activeFw = (btn.dataset.playFw as SnippetFw) || "react";
    root.querySelectorAll("[data-play-fw]").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    remount();
  };
  fwButtons.forEach((btn) => {
    btn.addEventListener("click", () => onFwClick(btn));
  });

  const onCopy = async () => {
    if (!copyBtn) return;
    try {
      await navigator.clipboard.writeText(codeEl.textContent || "");
      copyBtn.textContent = "Copied";
      window.setTimeout(() => {
        copyBtn.textContent = "Copy";
      }, 1200);
    } catch {
      copyBtn.textContent = "Failed";
    }
  };
  copyBtn?.addEventListener("click", onCopy);

  remount();

  return () => {
    triggerCleanup?.();
    triggerCleanup = null;
    handle?.destroy();
    handle = null;
    root
      .querySelectorAll<HTMLElement>(
        ".playground-options select, .playground-options input",
      )
      .forEach((el) => {
        el.removeEventListener("change", onOptionsChange);
      });
    copyBtn?.removeEventListener("click", onCopy);
  };
}

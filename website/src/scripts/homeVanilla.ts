import "dayjs/locale/fr";
import {
  createDateTimePicker,
  createDateTimeRangePicker,
  type DateTimePickerHandle,
  type DateTimeRangePickerHandle,
} from "universal-datetime-picker/vanilla";
import { HOME_SNIPPETS } from "../frameworks";

type Handle = DateTimePickerHandle | DateTimeRangePickerHandle;

export type HomeMode = "date" | "time" | "datetime" | "range" | "locale" | "dark";

function previewValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toString();
  return JSON.stringify(value, null, 2);
}

const MODE_SNIPPETS: Record<HomeMode, string> = {
  date: `createDateTimePicker(root, {
  inline: true,
  mode: "date",
  asString: false,
  onChange: console.log,
});`,
  time: `createDateTimePicker(root, {
  inline: true,
  mode: "time",
  asString: false,
  use12Hours: true,
  onChange: console.log,
});`,
  datetime: `createDateTimePicker(root, {
  inline: true,
  mode: "datetime",
  asString: false,
  use12Hours: true,
  onChange: console.log,
});`,
  range: `createDateTimeRangePicker(root, {
  inline: true,
  asString: false,
  onChange: console.log,
});`,
  locale: `import "dayjs/locale/fr";

createDateTimePicker(root, {
  inline: true,
  mode: "date",
  locale: "fr",
  weekStartsOn: 1,
  asString: false,
  onChange: console.log,
});`,
  dark: `createDateTimePicker(root, {
  inline: true,
  mode: "datetime",
  theme: "dark",
  asString: false,
  use12Hours: true,
  onChange: console.log,
});`,
};

function mountMode(
  stage: HTMLElement,
  out: HTMLElement,
  mode: HomeMode
): Handle {
  stage.replaceChildren();
  stage.removeAttribute("data-ctp-theme");
  const host = document.createElement("div");
  stage.appendChild(host);

  const onChange = (value: unknown) => {
    out.textContent = previewValue(value);
  };

  if (mode === "range") {
    return createDateTimeRangePicker(host, {
      inline: true,
      asString: false,
      onChange,
    });
  }

  if (mode === "locale") {
    return createDateTimePicker(host, {
      inline: true,
      mode: "date",
      locale: "fr",
      weekStartsOn: 1,
      asString: false,
      onChange,
    });
  }

  if (mode === "dark") {
    stage.setAttribute("data-ctp-theme", "dark");
    return createDateTimePicker(host, {
      inline: true,
      mode: "datetime",
      theme: "dark",
      asString: false,
      use12Hours: true,
      onChange,
    });
  }

  if (mode === "time") {
    return createDateTimePicker(host, {
      inline: true,
      mode: "time",
      asString: false,
      use12Hours: true,
      onChange,
    });
  }

  if (mode === "datetime") {
    return createDateTimePicker(host, {
      inline: true,
      mode: "datetime",
      asString: false,
      use12Hours: true,
      onChange,
    });
  }

  return createDateTimePicker(host, {
    inline: true,
    mode: "date",
    asString: false,
    onChange,
  });
}

export function initHomeModeStage(): () => void {
  const stage = document.querySelector<HTMLElement>("[data-home-stage]");
  const out = document.querySelector<HTMLElement>("[data-home-stage-out]");
  const snippet = document.querySelector<HTMLElement>("[data-home-mode-snippet]");
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-home-mode]");
  if (!stage || !out || !buttons.length) return () => {};

  let mode: HomeMode = "datetime";
  let handle: Handle | null = null;

  const render = () => {
    handle?.destroy();
    out.textContent = mode === "range" ? "null → null" : "null";
    handle = mountMode(stage, out, mode);
    if (snippet) snippet.textContent = MODE_SNIPPETS[mode];
    buttons.forEach((btn) => {
      const on = btn.dataset.homeMode === mode;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = (btn.dataset.homeMode as HomeMode) || "datetime";
      render();
    });
  });

  render();
  return () => handle?.destroy();
}

const TAB_SNIPPETS: Record<string, string> = {
  react: HOME_SNIPPETS.react,
  "vanilla-tab": HOME_SNIPPETS["vanilla-tab"],
  cdn: HOME_SNIPPETS.cdn,
  vue: HOME_SNIPPETS.vue,
  svelte: HOME_SNIPPETS.svelte,
  angular: HOME_SNIPPETS.angular,
};

const TAB_LINKS: Record<string, { href: string; label: string }> = {
  react: { href: "/react/", label: "React" },
  "vanilla-tab": { href: "/vanilla/", label: "Vanilla" },
  cdn: { href: "/cdn/", label: "CDN" },
  vue: { href: "/vue/", label: "Vue" },
  svelte: { href: "/svelte/", label: "Svelte" },
  angular: { href: "/angular/", label: "Angular" },
};

export function initHomeInstallTabs(): void {
  const tablist = document.querySelector<HTMLElement>("[data-home-tabs]");
  if (!tablist) return;

  const tabs = tablist.querySelectorAll<HTMLButtonElement>("[data-tab]");
  const codeEl = document.querySelector<HTMLElement>("[data-home-snippet-code]");
  const linkEl = document.querySelector<HTMLAnchorElement>("[data-home-demo-link]");
  const copyBtn = document.querySelector<HTMLButtonElement>("[data-home-copy]");

  let active = "react";

  const render = () => {
    const code = TAB_SNIPPETS[active] ?? "";
    const link = TAB_LINKS[active];
    if (!codeEl || !linkEl || !link) return;
    codeEl.textContent = code;
    linkEl.href = link.href;
    linkEl.textContent = `Open the ${link.label} page →`;
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === active;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      active = tab.dataset.tab ?? "react";
      render();
    });
  });

  copyBtn?.addEventListener("click", async () => {
    const code = TAB_SNIPPETS[active];
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      if (copyBtn) copyBtn.textContent = "Copied";
      setTimeout(() => {
        if (copyBtn) copyBtn.textContent = "Copy";
      }, 1600);
    } catch {
      /* ignore */
    }
  });

  render();
}

function flashCopyButton(btn: HTMLButtonElement): void {
  btn.classList.add("is-copied");
  btn.setAttribute("aria-label", "Copied");
  btn.setAttribute("title", "Copied");
  setTimeout(() => {
    btn.classList.remove("is-copied");
    btn.setAttribute("aria-label", "Copy install command");
    btn.setAttribute("title", "Copy");
  }, 1800);
}

export function initHomeCopyInstall(): void {
  const btn = document.querySelector<HTMLButtonElement>("[data-copy-install]");
  const line = document.querySelector<HTMLElement>("[data-install-cmd]");
  if (!btn || !line) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(line.textContent?.trim() ?? "");
      flashCopyButton(btn);
    } catch {
      /* ignore */
    }
  });
}

import {
  createDateTimePicker,
  createDateTimeRangePicker,
  type DateTimePickerHandle,
  type DateTimeRangePickerHandle,
} from "universal-datetime-picker/vanilla";

type Handle = DateTimePickerHandle | DateTimeRangePickerHandle;

function previewValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toString();
  }
  return JSON.stringify(value, null, 2);
}

function mountInline(
  root: HTMLElement,
  out: HTMLElement,
  options: Parameters<typeof createDateTimePicker>[1]
): Handle {
  return createDateTimePicker(root, {
    ...options,
    onChange: (value) => {
      out.textContent = previewValue(value);
      options?.onChange?.(value);
    },
  });
}

function mountHeroInput(anchor: HTMLElement, out: HTMLElement): Handle {
  anchor.classList.add("ctp-input");
  anchor.setAttribute("readonly", "");
  anchor.placeholder = "Pick a date & time";

  let handle: DateTimePickerHandle | null = null;
  const open = () => {
    handle?.destroy();
    handle = createDateTimePicker(anchor.parentElement!, {
      mode: "datetime",
      asString: false,
      use12Hours: true,
      popover: true,
      anchorEl: anchor,
      open: true,
      onChange: (value) => {
        out.textContent = previewValue(value);
      },
      onOpenChange: (isOpen) => {
        if (!isOpen) {
          handle?.destroy();
          handle = null;
        }
      },
    });
  };
  anchor.addEventListener("click", open);
  anchor.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });

  return {
    update: () => {},
    destroy: () => handle?.destroy(),
    getController: () => handle!.getController(),
  } as DateTimePickerHandle;
}

export function initHomeVanillaDemos(): () => void {
  const handles: Handle[] = [];

  const heroAnchor = document.querySelector<HTMLInputElement>("#hero-input");
  const heroOut = document.querySelector<HTMLElement>("#hero-value");
  if (heroAnchor && heroOut) {
    handles.push(mountHeroInput(heroAnchor, heroOut));
  }

  const mounts: Array<{
    sel: string;
    out: string;
    opts: Parameters<typeof createDateTimePicker>[1];
  }> = [
    {
      sel: "#ex-date",
      out: "#ex-date-out",
      opts: { inline: true, mode: "date", asString: false, disablePastDates: true },
    },
    {
      sel: "#ex-time",
      out: "#ex-time-out",
      opts: { inline: true, mode: "time", asString: false },
    },
    {
      sel: "#ex-time-ns",
      out: "#ex-time-ns-out",
      opts: { inline: true, mode: "time", asString: false, showSeconds: false },
    },
    {
      sel: "#ex-combined",
      out: "#ex-combined-out",
      opts: {
        inline: true,
        mode: "datetime",
        layout: "combined",
        asString: false,
      },
    },
    {
      sel: "#ex-tabs",
      out: "#ex-tabs-out",
      opts: { inline: true, mode: "datetime", layout: "tabs", asString: false },
    },
    {
      sel: "#ex-locale",
      out: "#ex-locale-out",
      opts: {
        inline: true,
        mode: "date",
        asString: false,
        locale: "fr",
        weekStartsOn: 1,
      },
    },
  ];

  for (const { sel, out, opts } of mounts) {
    const root = document.querySelector<HTMLElement>(sel);
    const output = document.querySelector<HTMLElement>(out);
    if (root && output) {
      handles.push(mountInline(root, output, opts));
    }
  }

  const inputAnchor = document.querySelector<HTMLInputElement>("#ex-input-anchor");
  const inputOut = document.querySelector<HTMLElement>("#ex-input-out");
  if (inputAnchor && inputOut) {
    inputAnchor.classList.add("ctp-input");
    inputAnchor.readOnly = true;
    inputAnchor.placeholder = "Pick a date & time";
    let popHandle: DateTimePickerHandle | null = null;
    const openInput = () => {
      popHandle?.destroy();
      popHandle = createDateTimePicker(inputAnchor.parentElement!, {
        mode: "datetime",
        asString: true,
        use12Hours: true,
        popover: true,
        anchorEl: inputAnchor,
        open: true,
        onChange: (value) => {
          inputOut.textContent = previewValue(value);
          if (typeof value === "string") {
            inputAnchor.value = value;
          }
        },
        onOpenChange: (open) => {
          if (!open) {
            popHandle?.destroy();
            popHandle = null;
          }
        },
      });
    };
    inputAnchor.addEventListener("click", openInput);
    handles.push({
      destroy: () => popHandle?.destroy(),
      update: () => {},
      getController: () => popHandle!.getController(),
    } as DateTimePickerHandle);
  }

  const rangeRoot = document.querySelector<HTMLElement>("#ex-range");
  const rangeOut = document.querySelector<HTMLElement>("#ex-range-out");
  if (rangeRoot && rangeOut) {
    handles.push(
      createDateTimeRangePicker(rangeRoot, {
        inline: true,
        asString: false,
        onChange: (value) => {
          rangeOut.textContent = `${previewValue(value.start)} → ${previewValue(value.end)}`;
        },
      })
    );
  }

  const darkDateRoot = document.querySelector<HTMLElement>("#ex-dark-date");
  const darkDateOut = document.querySelector<HTMLElement>("#ex-dark-out");
  const darkInputAnchor = document.querySelector<HTMLInputElement>("#ex-dark-input");
  if (darkDateRoot && darkDateOut) {
    handles.push(
      mountInline(darkDateRoot, darkDateOut, {
        inline: true,
        mode: "date",
        asString: false,
        theme: "dark",
      })
    );
  }
  if (darkInputAnchor && darkDateOut) {
    darkInputAnchor.classList.add("ctp-input");
    darkInputAnchor.readOnly = true;
    darkInputAnchor.placeholder = "Pick a time (opens on click)";
    let tHandle: DateTimePickerHandle | null = null;
    darkInputAnchor.addEventListener("click", () => {
      tHandle?.destroy();
      tHandle = createDateTimePicker(darkInputAnchor.parentElement!, {
        mode: "time",
        asString: true,
        use12Hours: true,
        theme: "dark",
        popover: true,
        anchorEl: darkInputAnchor,
        open: true,
        onChange: (value) => {
          const line = `Date: ${darkDateOut.textContent}\nTime: ${previewValue(value)}`;
          darkDateOut.textContent = line;
          if (typeof value === "string") {
            darkInputAnchor.value = value;
          }
        },
        onOpenChange: (open) => {
          if (!open) {
            tHandle?.destroy();
            tHandle = null;
          }
        },
      });
    });
    handles.push({
      destroy: () => tHandle?.destroy(),
      update: () => {},
      getController: () => tHandle!.getController(),
    } as DateTimePickerHandle);
  }

  return () => handles.forEach((h) => h.destroy());
}

import { HOME_SNIPPETS } from "../frameworks";

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
    linkEl.textContent = `See the live ${link.label} demo →`;
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

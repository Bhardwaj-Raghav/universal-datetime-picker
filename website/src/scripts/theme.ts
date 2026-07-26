const STORAGE_KEY = "udp-site-theme";

export type SiteTheme = "light" | "dark";

export function getPreferredTheme(): SiteTheme {
  if (typeof window === "undefined") {
    return "light";
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applySiteTheme(theme: SiteTheme): void {
  document.documentElement.setAttribute("data-site-theme", theme);
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#1a241c" : "#3f6a28");
  }
  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((btn) => {
    const next = theme === "dark" ? "light" : "dark";
    btn.setAttribute("aria-label", `Switch to ${next} mode`);
    btn.setAttribute("title", `Switch to ${next} mode`);
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  });
}

export function setSiteTheme(theme: SiteTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  applySiteTheme(theme);
}

export function toggleSiteTheme(): SiteTheme {
  const current =
    document.documentElement.getAttribute("data-site-theme") === "dark"
      ? "dark"
      : "light";
  const next: SiteTheme = current === "dark" ? "light" : "dark";
  setSiteTheme(next);
  return next;
}

export function initSiteTheme(): void {
  applySiteTheme(getPreferredTheme());

  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => toggleSiteTheme());
  });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) {
          return;
        }
      } catch {
        /* ignore */
      }
      applySiteTheme(event.matches ? "dark" : "light");
    });
}

export function initMobileNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const nav = document.querySelector<HTMLElement>("[data-site-nav]");
  if (!toggle || !nav) {
    return;
  }

  const setOpen = (open: boolean) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });

  window.matchMedia("(min-width: 769px)").addEventListener("change", (event) => {
    if (event.matches) {
      setOpen(false);
    }
  });
}

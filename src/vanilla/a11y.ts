const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const POPOVER_GAP = 8;
const POPOVER_PADDING = 8;
export const DEFAULT_PICKER_WIDTH = 300;
export const DEFAULT_PICKER_HEIGHT = 360;

export type Cleanup = () => void;

export function attachFocusTrap(
  container: HTMLElement,
  active: boolean
): Cleanup {
  if (!active) {
    return () => {};
  }

  const previouslyFocused = document.activeElement as HTMLElement | null;

  const focusables = () =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
    );

  const first = focusables()[0];
  first?.focus({ preventScroll: true });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") {
      return;
    }
    const items = focusables();
    if (items.length === 0) {
      return;
    }
    const firstItem = items[0]!;
    const lastItem = items[items.length - 1]!;
    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus({ preventScroll: true });
    }
  };

  container.addEventListener("keydown", onKeyDown);
  return () => {
    container.removeEventListener("keydown", onKeyDown);
    previouslyFocused?.focus?.({ preventScroll: true });
  };
}

export function attachEscape(handler: () => void, active: boolean): Cleanup {
  if (!active) {
    return () => {};
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handler();
    }
  };
  document.addEventListener("keydown", onKeyDown);
  return () => document.removeEventListener("keydown", onKeyDown);
}

export function attachClickOutside(
  handler: () => void,
  active: boolean,
  floating: HTMLElement | null,
  anchorEl?: HTMLElement | null
): Cleanup {
  if (!active) {
    return () => {};
  }

  const onPointerDown = (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (floating?.contains(target)) {
      return;
    }
    if (anchorEl?.contains(target)) {
      return;
    }
    handler();
  };

  document.addEventListener("pointerdown", onPointerDown, true);
  return () => {
    document.removeEventListener("pointerdown", onPointerDown, true);
  };
}

export function computePopoverPosition(
  anchorEl: HTMLElement,
  pickerWidth: number,
  pickerHeight: number
): { top: number; left: number } {
  const rect = anchorEl.getBoundingClientRect();
  let top = rect.bottom + POPOVER_GAP;
  let left = rect.left;

  if (left + pickerWidth > window.innerWidth - POPOVER_PADDING) {
    left = Math.max(
      POPOVER_PADDING,
      window.innerWidth - pickerWidth - POPOVER_PADDING
    );
  }
  if (left < POPOVER_PADDING) {
    left = POPOVER_PADDING;
  }

  if (top + pickerHeight > window.innerHeight - POPOVER_PADDING) {
    const above = rect.top - pickerHeight - POPOVER_GAP;
    if (above >= POPOVER_PADDING) {
      top = above;
    } else {
      top = Math.max(
        POPOVER_PADDING,
        window.innerHeight - pickerHeight - POPOVER_PADDING
      );
    }
  }

  return { top, left };
}

export function attachPopoverPosition(
  anchorEl: HTMLElement | null | undefined,
  open: boolean,
  enabled: boolean,
  floating: HTMLElement | null,
  onPosition: (pos: { top: number; left: number } | null) => void
): Cleanup {
  if (!open || !enabled || !anchorEl) {
    onPosition(null);
    return () => {};
  }

  const update = () => {
    if (!floating) {
      onPosition(
        computePopoverPosition(
          anchorEl,
          DEFAULT_PICKER_WIDTH,
          DEFAULT_PICKER_HEIGHT
        )
      );
      return;
    }
    const width = floating.offsetWidth || DEFAULT_PICKER_WIDTH;
    const height = floating.offsetHeight || DEFAULT_PICKER_HEIGHT;
    onPosition(computePopoverPosition(anchorEl, width, height));
  };

  update();
  window.addEventListener("resize", update);
  window.addEventListener("scroll", update, true);

  let observer: ResizeObserver | undefined;
  if (floating && typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(() => update());
    observer.observe(floating);
  }

  return () => {
    window.removeEventListener("resize", update);
    window.removeEventListener("scroll", update, true);
    observer?.disconnect();
  };
}

/** Resolve theme for portaled pickers (CSS vars don't cross portals). */
export function resolveThemeAttr(
  theme: "light" | "dark" | undefined,
  anchorEl: HTMLElement | null | undefined
): "light" | "dark" | undefined {
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  let node: HTMLElement | null | undefined = anchorEl ?? null;
  while (node) {
    const attr = node.getAttribute("data-ctp-theme");
    if (attr === "dark" || attr === "light") {
      return attr;
    }
    node = node.parentElement;
  }
  if (typeof document !== "undefined") {
    const root = document.documentElement.getAttribute("data-ctp-theme");
    if (root === "dark" || root === "light") {
      return root;
    }
  }
  return undefined;
}

export function cx(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}

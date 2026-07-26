/**
 * React a11y hooks — thin wrappers around framework-free vanilla helpers.
 * Prefer importing from `universal-datetime-picker/vanilla` in non-React code.
 */
import {
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  type RefObject,
} from "react";
import {
  attachClickOutside,
  attachEscape,
  attachFocusTrap,
  computePopoverPosition,
  DEFAULT_PICKER_HEIGHT,
  DEFAULT_PICKER_WIDTH,
} from "../vanilla/a11y";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean
): void {
  useEffect(() => {
    if (!active || !containerRef.current) {
      return;
    }
    return attachFocusTrap(containerRef.current, true);
  }, [active, containerRef]);
}

export function useOnEscape(handler: () => void, active: boolean): void {
  useEffect(() => {
    return attachEscape(handler, active);
  }, [active, handler]);
}

export function useOnClickOutside(
  handler: () => void,
  active: boolean,
  floatingRef: RefObject<HTMLElement | null>,
  anchorEl?: HTMLElement | null
): void {
  useEffect(() => {
    return attachClickOutside(
      handler,
      active,
      floatingRef.current,
      anchorEl
    );
  }, [active, handler, floatingRef, anchorEl]);
}

export function usePopoverPosition(
  anchorEl: HTMLElement | null | undefined,
  open: boolean,
  enabled: boolean,
  floatingRef: RefObject<HTMLElement | null>
): { top: number; left: number } | null {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const update = useCallback(() => {
    if (!enabled || !open || !anchorEl) {
      setPosition(null);
      return;
    }
    const floating = floatingRef.current;
    const width = floating?.offsetWidth || DEFAULT_PICKER_WIDTH;
    const height = floating?.offsetHeight || DEFAULT_PICKER_HEIGHT;
    setPosition(computePopoverPosition(anchorEl, width, height));
  }, [anchorEl, enabled, open, floatingRef]);

  useIsomorphicLayoutEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    if (!open || !enabled) {
      return;
    }
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const floating = floatingRef.current;
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
  }, [open, enabled, update, floatingRef]);

  if (!open || !enabled) {
    return null;
  }
  return position;
}

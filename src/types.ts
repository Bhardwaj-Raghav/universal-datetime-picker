import type { CSSProperties, ReactElement, ReactNode } from "react";
import type {
  DateTimeBaseOptions,
  DateTimeRangeOptions,
} from "./core/types";

export type {
  CalendarDay,
  CalendarPanel,
  DateRangeValue,
  DateTimeChangeValue,
  DateTimeLabels,
  DateTimeLayout,
  DateTimeMode,
  DateTimeValue,
  TimeValue,
} from "./core/types";
export { DEFAULT_LABELS } from "./core/types";

/** React picker props: core options with React `style`. */
export type DateTimeBaseProps = Omit<DateTimeBaseOptions, "style"> & {
  /** React inline styles for the picker root. */
  style?: CSSProperties;
};

/**
 * Props for {@link DateTime}.
 * Open/popover fields are redeclared so IntelliSense shows React-facing docs
 * (they also exist on {@link DateTimeBaseOptions}).
 */
export interface DateTimeProps extends DateTimeBaseProps {
  /**
   * Controlled open state for non-inline overlays/popovers.
   * When set, takes precedence over `defaultOpen`.
   *
   * @example
   * ```tsx
   * const [open, setOpen] = useState(false);
   * <DateTime open={open} onOpenChange={setOpen} defaultOpen={false} />
   * ```
   */
  open?: boolean;
  /**
   * Uncontrolled initial open state when `open` is omitted.
   * Ignored when `inline` (always open).
   * @default true
   */
  defaultOpen?: boolean;
  /** Called when overlay/popover open state changes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Anchor element for `popover` positioning (typically the trigger).
   *
   * @example
   * ```tsx
   * const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
   * <button ref={setAnchorEl} onClick={() => setOpen(true)}>Pick</button>
   * <DateTime popover anchorEl={anchorEl} open={open} onOpenChange={setOpen} />
   * ```
   */
  anchorEl?: HTMLElement | null;
  /**
   * Position beside `anchorEl` instead of a centered overlay.
   * Requires `anchorEl` for correct placement.
   * @default false
   */
  popover?: boolean;
}

/**
 * Props for {@link DateTimeInput}.
 * Open fields are redeclared for React-facing IntelliSense (also on base options).
 */
export interface DateTimeInputProps extends DateTimeBaseProps {
  /**
   * Controlled open state of the popover.
   * When set, takes precedence over `defaultOpen`.
   */
  open?: boolean;
  /**
   * Uncontrolled initial open state when `open` is omitted.
   * Unlike bare {@link DateTime}, the input trigger defaults to closed.
   * @default false
   */
  defaultOpen?: boolean;
  /** Called when the popover open state changes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Input placeholder text.
   * @default "Select date and time"
   */
  placeholder?: string;
  /** Passed through to the underlying `<input>`. */
  id?: string;
  /** Passed through to the underlying `<input>` for form submission. */
  name?: string;
  /** Disables the input and opening the picker. */
  disabled?: boolean;
  /**
   * When true (default), the input is read-only and opens via click/keyboard.
   * @default true
   */
  readOnly?: boolean;
  /** Sets `aria-labelledby` on the underlying `<input>`. */
  "aria-labelledby"?: string;
  /** Sets `aria-label` on the underlying `<input>`. */
  "aria-label"?: string;
  /** Class name on the underlying `<input>` (ignored when using `customInput`). */
  inputClassName?: string;
  /** Trailing icon; pass `null` to hide. Defaults to a calendar icon. */
  icon?: ReactNode;
  /** Replace the built-in input with a custom element (ref/value/onClick are injected). */
  customInput?: ReactElement;
  /** When true, omit default input wrapper/input classes so you style via `className` / `inputClassName`. */
  noStyle?: boolean;
}

/** Props for {@link DateTimeRange} (inline or modal; no popover/anchor). */
export type DateTimeRangeProps = Omit<DateTimeRangeOptions, "style"> & {
  /** React inline styles for the range picker root. */
  style?: CSSProperties;
};

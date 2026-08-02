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

export type DateTimeBaseProps = Omit<DateTimeBaseOptions, "style"> & {
  style?: CSSProperties;
};

export interface DateTimeProps extends DateTimeBaseProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  anchorEl?: HTMLElement | null;
  popover?: boolean;
}

export interface DateTimeInputProps extends DateTimeBaseProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  "aria-labelledby"?: string;
  "aria-label"?: string;
  inputClassName?: string;
  /** Trailing icon; pass `null` to hide. Defaults to a calendar icon. */
  icon?: ReactNode;
  /** Replace the built-in input with a custom element (ref/value/onClick are injected). */
  customInput?: ReactElement;
  /** When true, omit default input wrapper/input classes so you style via `className` / `inputClassName`. */
  noStyle?: boolean;
}

export type DateTimeRangeProps = Omit<DateTimeRangeOptions, "style"> & {
  style?: CSSProperties;
};

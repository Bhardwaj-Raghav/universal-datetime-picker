import {
  cloneElement,
  isValidElement,
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
  type ReactElement,
  type Ref,
} from "react";
import { DateTime } from "./DateTime";
import { useControllableState } from "./hooks/useControllableState";
import type { DateTimeChangeValue, DateTimeInputProps, DateTimeValue, TimeValue } from "./types";
import {
  dayjs,
  formatValue,
  parseValue,
  resolveFormat,
} from "./utils/date";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function isTimeValue(value: unknown): value is TimeValue {
  return (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof Date) &&
    "formatted" in value &&
    "hour24" in value
  );
}

function toDisplayString(
  value: DateTimeChangeValue | DateTimeValue | undefined,
  format: string
): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (isTimeValue(value)) {
    return value.formatted;
  }
  return formatValue(dayjs(value as Date), format);
}

function mergeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): (node: T | null) => void {
  return (node) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        (ref as MutableRefObject<T | null>).current = node;
      }
    });
  };
}

function DefaultCalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function DateTimeInput(props: DateTimeInputProps) {
  const {
    value,
    defaultValue = null,
    onChange,
    asString,
    showSeconds = true,
    format,
    mode = "datetime",
    use12Hours = false,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    placeholder = "Select date and time",
    id,
    name,
    disabled = false,
    readOnly = true,
    className,
    inputClassName,
    style,
    icon,
    customInput,
    noStyle = false,
    "aria-labelledby": ariaLabelledBy,
    "aria-label": ariaLabel,
    ...pickerProps
  } = props;

  const resolvedFormat = useMemo(
    () => resolveFormat({ mode, format, use12Hours, showSeconds }),
    [mode, format, use12Hours, showSeconds]
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const returnsObjects = asString !== true;

  const controlledFormatted =
    value !== undefined && !returnsObjects
      ? formatValue(parseValue(value, resolvedFormat), resolvedFormat)
      : undefined;

  const defaultFormatted = useMemo(
    () =>
      returnsObjects
        ? null
        : formatValue(parseValue(defaultValue, resolvedFormat), resolvedFormat),
    // only seed once from defaultValue
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [internalValue, setInternalValue] = useControllableState<string | null>({
    value: controlledFormatted,
    defaultValue: defaultFormatted,
    onChange: undefined,
  });

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const display = returnsObjects
    ? toDisplayString(
        value !== undefined ? value : defaultValue,
        resolvedFormat
      ) ?? ""
    : internalValue ?? "";

  const pickerValue = returnsObjects
    ? value !== undefined
      ? value
      : defaultValue
    : internalValue;

  const openPicker = useCallback(() => {
    if (!disabled) {
      setOpen(true);
    }
  }, [disabled, setOpen]);

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (disabled) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(true);
      }
    },
    [disabled, setOpen]
  );

  const setAnchorRef = useCallback((node: HTMLElement | null) => {
    setAnchorEl(node);
  }, []);

  const showIcon = icon !== null;
  const iconContent = icon === undefined ? <DefaultCalendarIcon /> : icon;

  const inputProps = {
    id,
    name,
    value: display,
    readOnly,
    disabled,
    placeholder,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
    "aria-labelledby": ariaLabelledBy,
    "aria-label": ariaLabel ?? placeholder,
    onClick: openPicker,
    onKeyDown: handleInputKeyDown,
  };

  let field: ReactElement;
  if (customInput && isValidElement(customInput)) {
    const customRef = (customInput as ReactElement & { ref?: Ref<HTMLElement> })
      .ref;
    field = cloneElement(
      customInput,
      {
        ...inputProps,
        ref: mergeRefs(setAnchorRef, customRef),
        className: cx(
          !noStyle && "ctp-input",
          (customInput.props as { className?: string }).className,
          inputClassName
        ),
      } as Record<string, unknown>
    );
  } else {
    field = (
      <input
        {...inputProps}
        ref={setAnchorRef}
        className={cx(
          !noStyle && "ctp-input",
          !noStyle && showIcon && "ctp-input-with-icon",
          inputClassName
        )}
      />
    );
  }

  return (
    <div
      className={cx(!noStyle && "ctp-input-root", className)}
      style={style}
    >
      <div className={cx(!noStyle && "ctp-input-field")}>
        {field}
        {showIcon && (
          <button
            type="button"
            className={cx(!noStyle && "ctp-input-icon-btn")}
            disabled={disabled}
            aria-label={ariaLabel ?? placeholder}
            tabIndex={-1}
            onClick={openPicker}
          >
            {iconContent}
          </button>
        )}
      </div>
      <DateTime
        {...pickerProps}
        format={format}
        mode={mode}
        use12Hours={use12Hours}
        asString={asString}
        showSeconds={showSeconds}
        value={pickerValue}
        open={open}
        onOpenChange={setOpen}
        popover
        anchorEl={anchorEl}
        onChange={(next) => {
          if (!returnsObjects) {
            setInternalValue(toDisplayString(next, resolvedFormat));
          }
          onChange?.(next);
        }}
      />
    </div>
  );
}

export default DateTimeInput;

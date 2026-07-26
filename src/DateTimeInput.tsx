import { useCallback, useMemo, useState } from "react";
import { DateTime } from "./DateTime";
import { useControllableState } from "./hooks/useControllableState";
import type { DateTimeChangeValue, DateTimeInputProps, TimeValue } from "./types";
import {
  dayjs,
  formatValue,
  parseValue,
  resolveFormat,
} from "./utils/date";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function isTimeValue(value: DateTimeChangeValue): value is TimeValue {
  return (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof Date) &&
    "formatted" in value &&
    "hour24" in value
  );
}

function toDisplayString(
  value: DateTimeChangeValue,
  format: string
): string | null {
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (isTimeValue(value)) {
    return value.formatted;
  }
  return formatValue(dayjs(value), format);
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
    "aria-labelledby": ariaLabelledBy,
    "aria-label": ariaLabel,
    ...pickerProps
  } = props;

  const resolvedFormat = useMemo(
    () => resolveFormat({ mode, format, use12Hours, showSeconds }),
    [mode, format, use12Hours, showSeconds]
  );

  const [anchorEl, setAnchorEl] = useState<HTMLInputElement | null>(null);

  const controlledFormatted =
    value !== undefined
      ? formatValue(parseValue(value, resolvedFormat), resolvedFormat)
      : undefined;

  const defaultFormatted = useMemo(
    () => formatValue(parseValue(defaultValue, resolvedFormat), resolvedFormat),
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

  const display = internalValue ?? "";

  const pickerValue =
    asString === false
      ? value !== undefined
        ? value
        : defaultValue
      : internalValue;

  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    setAnchorEl(node);
  }, []);

  return (
    <div className={cx("ctp-input-root", className)} style={style}>
      <input
        ref={setInputRef}
        id={id}
        name={name}
        className={cx("ctp-input", inputClassName)}
        value={display}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel ?? placeholder}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (disabled) {
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      />
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
          setInternalValue(toDisplayString(next, resolvedFormat));
          onChange?.(next);
        }}
      />
    </div>
  );
}

export default DateTimeInput;

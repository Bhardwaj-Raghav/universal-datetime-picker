import { DateTime } from "./DateTime";
import { DateTimeInput } from "./DateTimeInput";
import { DateTimeRange } from "./DateTimeRange";

/**
 * Default export shape: {@link DateTime} plus static shortcuts
 * `DateTime.Input` ({@link DateTimeInput}) and `DateTime.Range` ({@link DateTimeRange}).
 */
type DateTimeComponent = typeof DateTime & {
  /** Same as the named {@link DateTimeInput} export. */
  Input: typeof DateTimeInput;
  /** Same as the named {@link DateTimeRange} export. */
  Range: typeof DateTimeRange;
};

const DateTimeWithExtras = DateTime as DateTimeComponent;
DateTimeWithExtras.Input = DateTimeInput;
DateTimeWithExtras.Range = DateTimeRange;

export default DateTimeWithExtras;
export { DateTime, DateTimeInput, DateTimeRange };
export type {
  CalendarDay,
  DateRangeValue,
  DateTimeBaseProps,
  DateTimeChangeValue,
  DateTimeInputProps,
  DateTimeLabels,
  DateTimeLayout,
  DateTimeMode,
  DateTimeProps,
  DateTimeRangeProps,
  DateTimeValue,
  TimeValue,
} from "./types";
export { DEFAULT_LABELS } from "./types";
export { buildCalendarMonth } from "./calendar";
export { dayjs, DEFAULT_FORMAT, DATE_FORMAT, TIME_FORMAT } from "./utils/date";

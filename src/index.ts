import { DateTime } from "./DateTime";
import { DateTimeInput } from "./DateTimeInput";
import { DateTimeRange } from "./DateTimeRange";

type DateTimeComponent = typeof DateTime & {
  Input: typeof DateTimeInput;
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

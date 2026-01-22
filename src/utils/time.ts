import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export function getTimeDifference(date: string, type: string) {
  const now = dayjs();
  const target = dayjs(date);

  const diff = type === "countdown"
    ? target.diff(now)
    : now.diff(target);

  const durationObj = dayjs.duration(diff);

  return {
    days: Math.abs(durationObj.days()),
    hours: Math.abs(durationObj.hours()),
    minutes: Math.abs(durationObj.minutes()),
  };
}
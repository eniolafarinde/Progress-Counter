import dayjs from "dayjs";

export function getTimeDifference(date: string, type: string) {
  const now = dayjs();
  const target = dayjs(date);

  const diff = type === "countdown"
    ? target.diff(now)
    : now.diff(target);

  const duration = dayjs.duration(diff);

  return {
    days: Math.abs(duration.days()),
    hours: Math.abs(duration.hours()),
    minutes: Math.abs(duration.minutes()),
  };
}
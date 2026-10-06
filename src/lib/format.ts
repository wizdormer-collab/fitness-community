import {
  ACTIVITIES,
  LAGOS_AREAS,
  type ActivityId,
  type LagosAreaId,
} from "@/lib/types";

// ---------- Lookups ----------

export function areaLabel(id: LagosAreaId): string {
  return LAGOS_AREAS.find((a) => a.id === id)?.label ?? id;
}

export function activityOf(id: ActivityId) {
  return ACTIVITIES.find((a) => a.id === id) ?? ACTIVITIES[0];
}

export function activityLabel(id: ActivityId): string {
  return activityOf(id).label;
}

export function activityEmoji(id: ActivityId): string {
  return activityOf(id).emoji;
}

// ---------- Numbers ----------

export function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}

/** "1,234" — thousands separator for counts shown on screen. */
export function grouped(n: number): string {
  return n.toLocaleString("en-NG");
}

// ---------- Duration & pace ----------

/** Minutes → "45m" | "1h 18m" | "18h" */
export function duration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Minutes + km → "5:12 /km". Guards a zero distance. */
export function pace(durationMin: number, distanceKm: number): string {
  if (distanceKm <= 0) return "—";
  const sec = (durationMin * 60) / distanceKm;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

/** Minutes + km → "4:41/km" (compact, for list rows) */
export function paceCompact(durationMin: number, distanceKm: number): string {
  if (distanceKm <= 0) return "—";
  const sec = (durationMin * 60) / distanceKm;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Seconds → "29:42" for run finish times. */
export function clock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ---------- Dates ----------

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function dayName(index: number): string {
  return DAY_NAMES[index] ?? "Today";
}

export function todayDayLabel(): string {
  return dayName(new Date().getDay());
}

/** "Sat 12 Oct" — used on session rows. */
export function shortDate(date: Date): string {
  return `${DAY_NAMES[date.getDay()]!.slice(0, 3)} ${date.getDate()} ${
    MONTHS[date.getMonth()]
  }`;
}

/** "Today" | "Tomorrow" | "Sat 12 Oct" */
export function dayLabelFor(offsetDays: number): string {
  if (offsetDays === 0) return "Today";
  if (offsetDays === 1) return "Tomorrow";
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return shortDate(d);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ---------- Copy helpers ----------

export function plural(n: number, one: string, many = `${one}s`): string {
  return n === 1 ? one : many;
}

export function joined(count: number): string {
  return `${grouped(count)} ${plural(count, "person", "people")} training today`;
}

export function attending(count: number): string {
  return `${grouped(count)} people attending`;
}

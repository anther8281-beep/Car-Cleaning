import { prisma } from "@/lib/prisma";
import { getSettings, type SiteSettings } from "@/lib/settings";
import type { Weekday, DayHours } from "@/lib/types";
import { WEEKDAYS } from "@/lib/types";

// JS getUTCDay(): 0=Sun..6=Sat. Map to our Monday-first weekday keys.
const JS_DAY_TO_WEEKDAY: Weekday[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

/** Parse a "YYYY-MM-DD" string to a UTC-midnight Date (matches @db.Date). */
export function parseDateOnly(dateStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function weekdayOf(date: Date): Weekday {
  return JS_DAY_TO_WEEKDAY[date.getUTCDay()];
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** All slot start times for a day's open hours at the given interval. */
export function generateSlots(hours: DayHours, intervalMin: number): string[] {
  if (!hours) return [];
  const start = timeToMinutes(hours.open);
  const end = timeToMinutes(hours.close);
  const step = Math.max(15, intervalMin);
  const slots: string[] = [];
  for (let t = start; t + step <= end; t += step) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

/** Time slots that are taken (PENDING or CONFIRMED) on a given date. */
async function bookedTimes(date: Date, excludeId?: string): Promise<Set<string>> {
  const taken = await prisma.appointment.findMany({
    where: {
      date,
      status: { in: ["PENDING", "CONFIRMED"] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { time: true },
  });
  return new Set(taken.map((t) => t.time));
}

export type AvailabilityResult = {
  date: string;
  closed: boolean;
  slots: string[];
};

/** Available slots for a date string, given settings hours minus booked slots. */
export async function getAvailability(
  dateStr: string,
  settings?: SiteSettings,
): Promise<AvailabilityResult | null> {
  const date = parseDateOnly(dateStr);
  if (!date) return null;

  const s = settings ?? (await getSettings());
  const dayHours = s.hours[weekdayOf(date)];
  if (!dayHours) return { date: dateStr, closed: true, slots: [] };

  const all = generateSlots(dayHours, s.slotIntervalMin);
  const taken = await bookedTimes(date);

  // For today, drop slots already in the past.
  const now = new Date();
  const isToday = dateStr === now.toISOString().slice(0, 10);
  const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes();

  const slots = all.filter((slot) => {
    if (taken.has(slot)) return false;
    if (isToday && timeToMinutes(slot) <= nowMin) return false;
    return true;
  });

  return { date: dateStr, closed: false, slots };
}

/** Validate a requested slot is within open hours and not double-booked. */
export async function isSlotBookable(
  dateStr: string,
  time: string,
  settings: SiteSettings,
  excludeId?: string,
): Promise<boolean> {
  const date = parseDateOnly(dateStr);
  if (!date) return false;
  const dayHours = settings.hours[weekdayOf(date)];
  if (!dayHours) return false;
  if (!generateSlots(dayHours, settings.slotIntervalMin).includes(time)) {
    return false;
  }
  const taken = await bookedTimes(date, excludeId);
  return !taken.has(time);
}

export { WEEKDAYS };

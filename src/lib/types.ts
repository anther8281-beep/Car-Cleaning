// Shared domain types for the admin-editable Settings JSON fields.
// These describe the shape of `Settings.services` and `Settings.hours`.

export type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
};

export type DayHours = { open: string; close: string } | null;

export const WEEKDAYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export type WeekHours = Record<Weekday, DayHours>;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

// Default seed data — also used by the seed script and as fallbacks.
export const DEFAULT_SERVICES: Service[] = [
  {
    id: "basic-exterior-wash",
    name: "Basic Exterior Wash",
    description:
      "Hand wash, wheel cleaning, tire shine, and a streak-free dry of the exterior.",
    durationMinutes: 60,
    price: 40,
  },
  {
    id: "full-interior-detailing",
    name: "Full Interior Detailing",
    description:
      "Deep vacuum, steam clean, upholstery and carpet shampoo, dashboard and trim treatment.",
    durationMinutes: 120,
    price: 80,
  },
  {
    id: "full-detail-package",
    name: "Full Detail Package",
    description:
      "Complete inside-and-out detail combining our exterior wash and full interior service.",
    durationMinutes: 180,
    price: 110,
  },
];

export const DEFAULT_HOURS: WeekHours = {
  mon: { open: "08:00", close: "18:00" },
  tue: { open: "08:00", close: "18:00" },
  wed: { open: "08:00", close: "18:00" },
  thu: { open: "08:00", close: "18:00" },
  fri: { open: "08:00", close: "18:00" },
  sat: { open: "08:00", close: "18:00" },
  sun: null,
};

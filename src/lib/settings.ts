import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_HOURS,
  DEFAULT_SERVICES,
  type Service,
  type WeekHours,
} from "@/lib/types";
import type { Settings } from "@/generated/prisma/client";

export type SiteSettings = Omit<Settings, "services" | "hours"> & {
  services: Service[];
  hours: WeekHours;
};

/**
 * Load the Settings singleton, parsing the JSON columns into typed shapes and
 * falling back to defaults if the row is missing (e.g. before seeding). Wrapped
 * in React.cache so it is deduped within a single request/render.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await prisma.settings.findUnique({ where: { id: "singleton" } });

  if (!row) {
    return {
      id: "singleton",
      businessName: "Hernandez Auto Detailing",
      phone: "",
      contactEmail: "",
      services: DEFAULT_SERVICES,
      hours: DEFAULT_HOURS,
      logoUrl: null,
      primaryColor: "#1a2e5a",
      secondaryColor: "#c9a84c",
      seoTitle: "Hernandez Auto Detailing",
      seoDescription:
        "Professional car detailing. Book your appointment online.",
      slotIntervalMin: 60,
      updatedAt: new Date(),
    };
  }

  return {
    ...row,
    services: normalizeServices(row.services),
    hours: normalizeHours(row.hours),
  };
});

function normalizeServices(value: unknown): Service[] {
  if (!Array.isArray(value)) return DEFAULT_SERVICES;
  return value.filter(
    (s): s is Service =>
      !!s &&
      typeof s === "object" &&
      typeof (s as Service).id === "string" &&
      typeof (s as Service).name === "string",
  );
}

function normalizeHours(value: unknown): WeekHours {
  if (!value || typeof value !== "object") return DEFAULT_HOURS;
  return { ...DEFAULT_HOURS, ...(value as Partial<WeekHours>) } as WeekHours;
}

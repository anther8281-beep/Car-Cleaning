"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validation";

export type SettingsState = { error?: string; ok?: string };

export async function updateSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const session = await requireUser();

  let services: unknown;
  let hours: unknown;
  try {
    services = JSON.parse(String(formData.get("servicesJson") ?? "[]"));
    hours = JSON.parse(String(formData.get("hoursJson") ?? "{}"));
  } catch {
    return { error: "Could not read services or hours data." };
  }

  const parsed = settingsSchema.safeParse({
    businessName: formData.get("businessName"),
    phone: formData.get("phone") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
    primaryColor: formData.get("primaryColor"),
    secondaryColor: formData.get("secondaryColor"),
    slotIntervalMin: formData.get("slotIntervalMin"),
    services,
    hours,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Some fields are invalid.",
    };
  }
  const data = parsed.data;

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {
      businessName: data.businessName,
      phone: data.phone,
      contactEmail: data.contactEmail,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      logoUrl: data.logoUrl || null,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      slotIntervalMin: data.slotIntervalMin,
      services: data.services,
      hours: data.hours,
    },
    create: {
      id: "singleton",
      businessName: data.businessName,
      phone: data.phone,
      contactEmail: data.contactEmail,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      logoUrl: data.logoUrl || null,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      slotIntervalMin: data.slotIntervalMin,
      services: data.services,
      hours: data.hours,
    },
  });

  // The whole site renders dynamically, but revalidate to drop any cached
  // copies of the layout/pages that read settings.
  revalidatePath("/", "layout");

  return { ok: "Settings saved." };
}

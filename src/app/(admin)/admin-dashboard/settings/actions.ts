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
  await requireUser();

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
    tagline: formData.get("tagline") ?? "",
    phone: formData.get("phone") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    address: formData.get("address") ?? "",
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription") ?? "",
    seoKeywords: formData.get("seoKeywords") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
    primaryColor: formData.get("primaryColor"),
    secondaryColor: formData.get("secondaryColor"),
    slotIntervalMin: formData.get("slotIntervalMin"),
    leadTimeHours: formData.get("leadTimeHours"),
    maxAdvanceDays: formData.get("maxAdvanceDays"),
    services,
    hours,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Some fields are invalid.",
    };
  }
  const data = parsed.data;
  const fields = {
    businessName: data.businessName,
    tagline: data.tagline,
    phone: data.phone,
    contactEmail: data.contactEmail,
    address: data.address,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    seoKeywords: data.seoKeywords,
    logoUrl: data.logoUrl || null,
    primaryColor: data.primaryColor,
    secondaryColor: data.secondaryColor,
    slotIntervalMin: data.slotIntervalMin,
    leadTimeHours: data.leadTimeHours,
    maxAdvanceDays: data.maxAdvanceDays,
    services: data.services,
    hours: data.hours,
  };

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: fields,
    create: { id: "singleton", ...fields },
  });

  // The whole site renders dynamically, but revalidate to drop any cached
  // copies of the layout/pages that read settings.
  revalidatePath("/", "layout");

  return { ok: "Settings saved." };
}

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

  // Be forgiving about logo URLs: a bare domain like "site.com/logo.png" gets
  // an https:// prefix so it validates instead of failing the whole save.
  let logoUrl = String(formData.get("logoUrl") ?? "").trim();
  if (logoUrl && !/^https?:\/\//i.test(logoUrl)) {
    logoUrl = `https://${logoUrl}`;
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
    logoUrl,
    primaryColor: formData.get("primaryColor"),
    secondaryColor: formData.get("secondaryColor"),
    slotIntervalMin: formData.get("slotIntervalMin"),
    leadTimeHours: formData.get("leadTimeHours"),
    maxAdvanceDays: formData.get("maxAdvanceDays"),
    services,
    hours,
  });

  if (!parsed.success) {
    // Name the offending field so the user knows exactly what to fix.
    const issue = parsed.error.issues[0];
    const fieldLabels: Record<string, string> = {
      businessName: "Business name",
      tagline: "Tagline",
      phone: "Phone",
      contactEmail: "Contact email",
      address: "Address",
      seoTitle: "SEO title",
      seoDescription: "SEO description",
      seoKeywords: "SEO keywords",
      logoUrl: "Logo URL",
      primaryColor: "Primary color",
      secondaryColor: "Secondary color",
      slotIntervalMin: "Booking slot interval",
      leadTimeHours: "Minimum lead time",
      maxAdvanceDays: "Max advance booking",
      services: "Services",
      hours: "Business hours",
    };
    const top = issue?.path?.[0];
    const label =
      typeof top === "string" && fieldLabels[top] ? fieldLabels[top] : null;
    return {
      error: label
        ? `${label}: ${issue?.message ?? "is invalid"}`
        : (issue?.message ?? "Some fields are invalid."),
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

  try {
    await prisma.settings.upsert({
      where: { id: "singleton" },
      update: fields,
      create: { id: "singleton", ...fields },
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "settings_update_failed",
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return { error: "Could not save — a server error occurred. Please try again." };
  }

  // The whole site renders dynamically, but revalidate to drop any cached
  // copies of the layout/pages that read settings.
  revalidatePath("/", "layout");

  return { ok: "Settings saved." };
}

import { requireUser } from "@/lib/auth/guard";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser();
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Site settings
      </h1>
      <SettingsForm
        initial={{
          businessName: settings.businessName,
          phone: settings.phone,
          contactEmail: settings.contactEmail,
          seoTitle: settings.seoTitle,
          seoDescription: settings.seoDescription,
          logoUrl: settings.logoUrl ?? "",
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          slotIntervalMin: settings.slotIntervalMin,
          services: settings.services,
          hours: settings.hours,
        }}
      />
    </div>
  );
}

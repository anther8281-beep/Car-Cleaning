import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = { title: "Book an Appointment" };

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const settings = await getSettings();
  const { service: serviceId } = await searchParams;
  const preselected = settings.services.find((s) => s.id === serviceId)?.name;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        Book an appointment
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Choose a service and a time. We&apos;ll confirm your request by email.
      </p>

      <div className="mt-8">
        <BookingForm
          services={settings.services}
          preselectedService={preselected ?? ""}
        />
      </div>
    </div>
  );
}

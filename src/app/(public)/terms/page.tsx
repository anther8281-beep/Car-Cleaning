import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Terms of Service" };

export default async function TermsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        Terms of Service
      </h1>
      <div className="mt-6 space-y-4 text-sm text-[var(--muted)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Bookings
        </h2>
        <p>
          Appointment requests made through this website are subject to
          confirmation by {settings.businessName}. A booking is not guaranteed
          until you receive a confirmation message.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Cancellations and rescheduling
        </h2>
        <p>
          You may reschedule or cancel your appointment using the link in your
          confirmation message. We appreciate as much notice as possible so we
          can offer the slot to other customers.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Pricing
        </h2>
        <p>
          Prices listed are estimates for standard vehicles. Final pricing may
          vary based on vehicle size and condition, and will be confirmed before
          work begins.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Liability
        </h2>
        <p>
          We take great care with every vehicle. Please remove valuables before
          your appointment; {settings.businessName} is not responsible for items
          left in the vehicle.
        </p>
      </div>
    </div>
  );
}

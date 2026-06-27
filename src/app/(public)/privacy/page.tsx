import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose-sm">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-4 text-sm text-[var(--muted)]">
        <p>
          {settings.businessName} (&quot;we&quot;) respects your privacy. This
          policy explains what information we collect and how we use it.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Information we collect
        </h2>
        <p>
          When you book an appointment or contact us, we collect the details you
          provide: your name, phone number, email address, selected service, and
          any notes. We use this information solely to schedule and deliver your
          service and to communicate with you about your appointment.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          How we use your information
        </h2>
        <p>
          We use your information to confirm bookings, send appointment-related
          notifications, and respond to inquiries. We do not sell your personal
          information to third parties.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Data retention
        </h2>
        <p>
          We retain appointment records for as long as necessary to provide our
          services and meet legal obligations. You may request deletion of your
          information by contacting us.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Contact
        </h2>
        <p>
          For privacy questions, contact us
          {settings.contactEmail ? ` at ${settings.contactEmail}` : ""}.
        </p>
      </div>
    </div>
  );
}

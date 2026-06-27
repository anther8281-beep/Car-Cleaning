import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">Contact us</h1>
      <p className="mt-2 text-[var(--muted)]">
        Questions about a service or your booking? Send us a message.
      </p>

      {(settings.phone || settings.contactEmail) && (
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          {settings.phone ? (
            <a
              href={`tel:${settings.phone}`}
              className="text-[var(--foreground)] hover:text-[var(--primary)]"
            >
              📞 {settings.phone}
            </a>
          ) : null}
          {settings.contactEmail ? (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="text-[var(--foreground)] hover:text-[var(--primary)]"
            >
              ✉️ {settings.contactEmail}
            </a>
          ) : null}
        </div>
      )}

      {settings.address ? (
        <p className="mt-3 text-sm text-[var(--muted)]">📍 {settings.address}</p>
      ) : null}

      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}

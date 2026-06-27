import Link from "next/link";
import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { QuoteNote } from "@/components/quote-note";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">Services</h1>
      <p className="mt-2 text-[var(--muted)]">
        Choose the level of care your vehicle deserves.
      </p>

      <QuoteNote className="mt-4" />

      <div className="mt-10 space-y-4">
        {settings.services.map((service) => (
          <div
            key={service.id}
            className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {service.name}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {service.description}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Approximately {service.durationMinutes} minutes
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-[var(--primary)]">
                ${service.price}
              </span>
              <Link
                href={`/booking?service=${encodeURIComponent(service.id)}`}
                className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Book
              </Link>
            </div>
          </div>
        ))}
        {settings.services.length === 0 ? (
          <p className="text-[var(--muted)]">
            Services are being updated. Please check back soon.
          </p>
        ) : null}
      </div>
    </div>
  );
}

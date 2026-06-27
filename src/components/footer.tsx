import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";
import { WEEKDAYS, WEEKDAY_LABELS } from "@/lib/types";
import { formatTimeRange } from "@/lib/time";

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--primary)]">
            {settings.businessName}
          </h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {settings.seoDescription}
          </p>
          {settings.phone ? (
            <p className="mt-3 text-sm text-[var(--foreground)]">
              <span className="text-[var(--muted)]">Phone:</span>{" "}
              <a href={`tel:${settings.phone}`} className="hover:underline">
                {settings.phone}
              </a>
            </p>
          ) : null}
          {settings.contactEmail ? (
            <p className="text-sm text-[var(--foreground)]">
              <span className="text-[var(--muted)]">Email:</span>{" "}
              <a
                href={`mailto:${settings.contactEmail}`}
                className="hover:underline"
              >
                {settings.contactEmail}
              </a>
            </p>
          ) : null}
          {settings.address ? (
            <p className="mt-1 text-sm text-[var(--muted)]">
              {settings.address}
            </p>
          ) : null}
        </div>

        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">
            Links
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
            <li>
              <Link href="/services" className="hover:text-[var(--primary)]">
                Services
              </Link>
            </li>
            <li>
              <Link href="/booking" className="hover:text-[var(--primary)]">
                Book an appointment
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[var(--primary)]">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[var(--primary)]">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-[var(--primary)]">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[var(--primary)]">
                Terms
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">
            Hours
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
            {WEEKDAYS.map((day) => {
              const h = settings.hours[day];
              return (
                <li key={day} className="flex justify-between gap-4">
                  <span>{WEEKDAY_LABELS[day]}</span>
                  <span className="text-[var(--foreground)]">
                    {h ? formatTimeRange(h.open, h.close) : "Closed"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-4 py-4 text-center text-xs text-[var(--muted)]">
        © {year} {settings.businessName}. All rights reserved.
      </div>
    </footer>
  );
}

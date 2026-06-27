import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        About {settings.businessName}
      </h1>
      <div className="mt-6 space-y-4 text-[var(--muted)]">
        <p>
          {settings.businessName} is a locally owned auto detailing service
          dedicated to making your vehicle look and feel its best. From a quick
          exterior refresh to a full inside-and-out transformation, we treat
          every car as if it were our own.
        </p>
        <p>
          Our team combines professional-grade products with careful, hands-on
          work. We take the time to do the job right, so you can drive away in a
          car that genuinely shines.
        </p>
        <p>
          Booking is simple: choose your service and a time that works for you,
          and we&apos;ll take care of the rest. We look forward to earning your
          trust and your repeat business.
        </p>
      </div>
    </div>
  );
}

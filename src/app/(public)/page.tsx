import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { QuoteNote } from "@/components/quote-note";

export default async function HomePage() {
  const settings = await getSettings();
  const featured = settings.services.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--primary)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {settings.businessName}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            {settings.tagline || settings.seoDescription}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/booking"
              className="rounded-md bg-[var(--secondary)] px-6 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Book an appointment
            </Link>
            <Link
              href="/services"
              className="rounded-md border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              View services
            </Link>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            Our Services
          </h2>
          <p className="mt-2 text-[var(--muted)]">
            Professional detailing tailored to your vehicle.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {service.name}
              </h3>
              <p className="mt-2 flex-1 text-sm text-[var(--muted)]">
                {service.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-[var(--primary)]">
                  ${service.price}
                </span>
                <span className="text-xs text-[var(--muted)]">
                  ~{service.durationMinutes} min
                </span>
              </div>
              <Link
                href="/booking"
                className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
              >
                Book this
              </Link>
            </div>
          ))}
        </div>
        <QuoteNote className="mx-auto mt-8 max-w-2xl text-center" />
      </section>

      {/* Why us */}
      <section className="bg-[var(--surface-muted)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
          {[
            {
              title: "Experienced team",
              body: "Meticulous, detail-obsessed care for every vehicle we touch.",
            },
            {
              title: "Easy online booking",
              body: "Pick a service and time in under a minute. No phone tag.",
            },
            {
              title: "Satisfaction first",
              body: "We aren't done until your car looks and feels brand new.",
            },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Ready for a spotless ride?
        </h2>
        <Link
          href="/booking"
          className="mt-6 inline-block rounded-md bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Book your appointment
        </Link>
      </section>
    </>
  );
}

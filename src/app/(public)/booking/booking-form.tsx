"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@/lib/types";
import { formatTime } from "@/lib/time";

type AvailabilityResponse = {
  date: string;
  closed: boolean;
  slots: string[];
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const maxDateStr = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

export function BookingForm({
  services,
  preselectedService,
  maxAdvanceDays,
}: {
  services: Service[];
  preselectedService: string;
  maxAdvanceDays: number;
}) {
  const router = useRouter();
  const [service, setService] = useState(
    preselectedService || services[0]?.name || "",
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Fetch availability whenever the chosen date changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!date) {
      setSlots([]);
      setClosed(false);
      return;
    }
    let active = true;
    setLoadingSlots(true);
    setTime("");
    fetch(`/api/appointments/availability?date=${date}`)
      .then((r) => r.json())
      .then((data: AvailabilityResponse) => {
        if (!active) return;
        setClosed(data.closed);
        setSlots(data.slots ?? []);
      })
      .catch(() => active && setSlots([]))
      .finally(() => active && setLoadingSlots(false));
    return () => {
      active = false;
    };
  }, [date]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!time) {
      setError("Please choose an available time slot.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      customerName: fd.get("customerName"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      service,
      date,
      time,
      notes: fd.get("notes") ?? "",
    };
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        // If the slot was taken, refresh availability.
        if (res.status === 409 && date) {
          const fresh = await fetch(
            `/api/appointments/availability?date=${date}`,
          ).then((r) => r.json());
          setSlots(fresh.slots ?? []);
          setTime("");
        }
        throw new Error(body.error ?? "Could not submit your booking.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-300 bg-green-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-green-800">
          Request received!
        </h2>
        <p className="mt-2 text-sm text-green-700">
          Thanks for booking. We&apos;ve emailed you a confirmation and will
          notify you once your appointment is approved.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Service
        </label>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
        >
          {services.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name} — ${s.price}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Date
        </label>
        <input
          type="date"
          required
          min={todayStr()}
          max={maxDateStr(maxAdvanceDays)}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
        />
      </div>

      {date ? (
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Time
          </label>
          {loadingSlots ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Checking availability…
            </p>
          ) : closed ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              We&apos;re closed on this day. Please pick another date.
            </p>
          ) : slots.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              No times available on this day. Please pick another date.
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`rounded-md border px-2 py-2 text-sm transition ${
                    time === slot
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Full name
          </label>
          <input
            name="customerName"
            required
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Phone
          </label>
          <input
            name="phone"
            type="tel"
            required
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Vehicle type, special requests, etc."
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !time}
        className="w-full rounded-md bg-[var(--primary)] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Request appointment"}
      </button>
    </form>
  );
}

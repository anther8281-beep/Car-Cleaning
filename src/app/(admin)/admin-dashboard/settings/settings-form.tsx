"use client";

import { useActionState, useState } from "react";
import { updateSettings, type SettingsState } from "./actions";
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  type Service,
  type WeekHours,
  type DayHours,
} from "@/lib/types";

type Initial = {
  businessName: string;
  tagline: string;
  phone: string;
  contactEmail: string;
  address: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  slotIntervalMin: number;
  leadTimeHours: number;
  maxAdvanceDays: number;
  services: Service[];
  hours: WeekHours;
};

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)]";

export function SettingsForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateSettings,
    {},
  );
  const [services, setServices] = useState<Service[]>(initial.services);
  const [hours, setHours] = useState<WeekHours>(initial.hours);

  function updateService(idx: number, patch: Partial<Service>) {
    setServices((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    );
  }
  function addService() {
    setServices((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `svc-${Date.now()}`,
        name: "",
        description: "",
        durationMinutes: 60,
        price: 0,
      },
    ]);
  }
  function removeService(idx: number) {
    setServices((prev) => prev.filter((_, i) => i !== idx));
  }

  function setDay(day: (typeof WEEKDAYS)[number], value: DayHours) {
    setHours((prev) => ({ ...prev, [day]: value }));
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.ok ? (
        <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.ok}
        </div>
      ) : null}
      {state.error ? (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      {/* Hidden serialized JSON for services + hours */}
      <input type="hidden" name="servicesJson" value={JSON.stringify(services)} />
      <input type="hidden" name="hoursJson" value={JSON.stringify(hours)} />

      {/* Business info */}
      <Section title="Business information">
        <Grid>
          <Field label="Business name">
            <input
              name="businessName"
              defaultValue={initial.businessName}
              className={inputClass}
            />
          </Field>
          <Field label="Tagline">
            <input
              name="tagline"
              defaultValue={initial.tagline}
              className={inputClass}
            />
          </Field>
          <Field label="Phone">
            <input
              name="phone"
              defaultValue={initial.phone}
              className={inputClass}
            />
          </Field>
          <Field label="Contact email">
            <input
              name="contactEmail"
              type="email"
              defaultValue={initial.contactEmail}
              className={inputClass}
            />
          </Field>
          <Field label="Address">
            <input
              name="address"
              defaultValue={initial.address}
              className={inputClass}
            />
          </Field>
          <Field label="Logo URL">
            <input
              name="logoUrl"
              defaultValue={initial.logoUrl}
              placeholder="https://…"
              className={inputClass}
            />
          </Field>
        </Grid>
      </Section>

      {/* Branding */}
      <Section title="Branding & booking">
        <Grid>
          <Field label="Primary color">
            <input
              name="primaryColor"
              type="color"
              defaultValue={initial.primaryColor}
              className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)]"
            />
          </Field>
          <Field label="Secondary color">
            <input
              name="secondaryColor"
              type="color"
              defaultValue={initial.secondaryColor}
              className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)]"
            />
          </Field>
          <Field label="Booking slot interval (minutes)">
            <input
              name="slotIntervalMin"
              type="number"
              min={15}
              max={240}
              step={15}
              defaultValue={initial.slotIntervalMin}
              className={inputClass}
            />
          </Field>
          <Field label="Minimum lead time (hours)">
            <input
              name="leadTimeHours"
              type="number"
              min={0}
              max={720}
              defaultValue={initial.leadTimeHours}
              className={inputClass}
            />
          </Field>
          <Field label="Max advance booking (days)">
            <input
              name="maxAdvanceDays"
              type="number"
              min={1}
              max={365}
              defaultValue={initial.maxAdvanceDays}
              className={inputClass}
            />
          </Field>
        </Grid>
      </Section>

      {/* SEO */}
      <Section title="SEO">
        <Field label="SEO title">
          <input
            name="seoTitle"
            defaultValue={initial.seoTitle}
            className={inputClass}
          />
        </Field>
        <Field label="SEO description">
          <textarea
            name="seoDescription"
            rows={2}
            defaultValue={initial.seoDescription}
            className={inputClass}
          />
        </Field>
        <Field label="SEO keywords (comma-separated)">
          <input
            name="seoKeywords"
            defaultValue={initial.seoKeywords}
            placeholder="car detailing, auto detailing, car wash"
            className={inputClass}
          />
        </Field>
      </Section>

      {/* Services */}
      <Section title="Services">
        <div className="space-y-4">
          {services.map((s, idx) => (
            <div
              key={s.id}
              className="rounded-lg border border-[var(--border)] p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name">
                  <input
                    value={s.name}
                    onChange={(e) => updateService(idx, { name: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Price ($)">
                  <input
                    type="number"
                    min={0}
                    value={s.price}
                    onChange={(e) =>
                      updateService(idx, { price: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Duration (minutes)">
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={s.durationMinutes}
                    onChange={(e) =>
                      updateService(idx, {
                        durationMinutes: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Description">
                  <input
                    value={s.description}
                    onChange={(e) =>
                      updateService(idx, { description: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() => removeService(idx)}
                className="mt-3 text-sm text-red-600 hover:underline"
              >
                Remove service
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addService}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
          >
            + Add service
          </button>
        </div>
      </Section>

      {/* Hours */}
      <Section title="Business hours">
        <div className="space-y-2">
          {WEEKDAYS.map((day) => {
            const dh = hours[day];
            const closed = dh === null;
            return (
              <div
                key={day}
                className="flex flex-wrap items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2"
              >
                <span className="w-24 text-sm font-medium text-[var(--foreground)]">
                  {WEEKDAY_LABELS[day]}
                </span>
                <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <input
                    type="checkbox"
                    checked={closed}
                    onChange={(e) =>
                      setDay(
                        day,
                        e.target.checked ? null : { open: "08:00", close: "18:00" },
                      )
                    }
                  />
                  Closed
                </label>
                {!closed ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={dh.open}
                      onChange={(e) =>
                        setDay(day, { ...dh, open: e.target.value })
                      }
                      className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
                    />
                    <span className="text-[var(--muted)]">to</span>
                    <input
                      type="time"
                      value={dh.close}
                      onChange={(e) =>
                        setDay(day, { ...dh, close: e.target.value })
                      }
                      className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--primary)] px-6 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)]">
        {label}
      </label>
      {children}
    </div>
  );
}

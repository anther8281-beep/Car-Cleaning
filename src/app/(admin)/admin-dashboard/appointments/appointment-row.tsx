"use client";

import { useState, useTransition } from "react";
import {
  approveAppointment,
  rejectAppointment,
  deleteAppointment,
  setAppointmentStatus,
  setAdminNotes,
} from "./actions";
import { formatTime } from "@/lib/time";

type Appt = {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  service: string;
  durationMinutes: number;
  priceCents: number;
  date: string;
  time: string;
  notes: string | null;
  adminNotes: string | null;
  status: string;
};

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "RESCHEDULED",
  "COMPLETED",
  "NO_SHOW",
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RESCHEDULED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  NO_SHOW: "bg-gray-200 text-gray-700",
};

export function AppointmentRow({ appointment }: { appointment: Appt }) {
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  const run = (fn: () => Promise<void>) => () => startTransition(fn);

  return (
    <>
      <tr className="border-b border-[var(--border)] last:border-0">
        <td className="px-4 py-3 text-[var(--foreground)]">
          <div className="font-medium">{appointment.date}</div>
          <div className="text-xs text-[var(--muted)]">
            {formatTime(appointment.time)}
          </div>
        </td>
        <td className="px-4 py-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-left font-medium text-[var(--foreground)] hover:underline"
          >
            {appointment.customerName}
          </button>
        </td>
        <td className="px-4 py-3 text-[var(--foreground)]">
          {appointment.service}
        </td>
        <td className="px-4 py-3">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              STATUS_STYLES[appointment.status] ?? "bg-gray-100 text-gray-800"
            }`}
          >
            {appointment.status}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {appointment.status !== "CONFIRMED" ? (
              <button
                disabled={pending}
                onClick={run(() => approveAppointment(appointment.id))}
                className="rounded border border-green-300 px-2 py-1 text-xs text-green-700 hover:bg-green-50 disabled:opacity-50"
              >
                Approve
              </button>
            ) : null}
            {appointment.status !== "CANCELLED" ? (
              <button
                disabled={pending}
                onClick={run(() => rejectAppointment(appointment.id))}
                className="rounded border border-amber-300 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-50"
              >
                Cancel
              </button>
            ) : null}
            <button
              disabled={pending}
              onClick={() => {
                if (confirm("Delete this appointment permanently?")) {
                  startTransition(() => deleteAppointment(appointment.id));
                }
              }}
              className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {expanded ? (
        <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
          <td colSpan={5} className="px-4 py-3 text-sm text-[var(--foreground)]">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-[var(--muted)]">Email:</span>{" "}
                <a href={`mailto:${appointment.email}`} className="underline">
                  {appointment.email}
                </a>
              </div>
              <div>
                <span className="text-[var(--muted)]">Phone:</span>{" "}
                <a href={`tel:${appointment.phone}`} className="underline">
                  {appointment.phone}
                </a>
              </div>
              {appointment.notes ? (
                <div className="sm:col-span-2">
                  <span className="text-[var(--muted)]">Notes:</span>{" "}
                  {appointment.notes}
                </div>
              ) : null}
              <div>
                <span className="text-[var(--muted)]">Service:</span>{" "}
                {appointment.durationMinutes} min · $
                {(appointment.priceCents / 100).toFixed(0)}
              </div>
              <div className="sm:col-span-2">
                <label className="text-[var(--muted)]">Set status: </label>
                <select
                  defaultValue={appointment.status}
                  disabled={pending}
                  onChange={(e) =>
                    startTransition(() =>
                      setAppointmentStatus(appointment.id, e.target.value),
                    )
                  }
                  className="rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[var(--muted)]">
                  Internal notes (not shown to customer):
                </label>
                <textarea
                  defaultValue={appointment.adminNotes ?? ""}
                  disabled={pending}
                  rows={2}
                  onBlur={(e) =>
                    startTransition(() =>
                      setAdminNotes(appointment.id, e.target.value),
                    )
                  }
                  placeholder="Save by clicking away…"
                  className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
                />
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

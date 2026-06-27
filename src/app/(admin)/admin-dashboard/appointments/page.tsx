import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import type { AppointmentStatus } from "@/generated/prisma/client";
import { AppointmentRow } from "./appointment-row";

export const dynamic = "force-dynamic";

const STATUSES: (AppointmentStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "RESCHEDULED",
];

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser();
  const { status } = await searchParams;
  const filter = STATUSES.includes(status as AppointmentStatus)
    ? (status as AppointmentStatus)
    : "ALL";

  const appointments = await prisma.appointment.findMany({
    where: filter === "ALL" ? {} : { status: filter },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    take: 500,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Appointments
        </h1>
        <a
          href="/admin-dashboard/appointments/export"
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
        >
          Export CSV
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "ALL" ? "?" : `?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === s
                ? "bg-[var(--primary)] text-white"
                : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Date / Time</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-[var(--muted)]"
                >
                  No appointments found.
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <AppointmentRow
                  key={a.id}
                  appointment={{
                    id: a.id,
                    customerName: a.customerName,
                    phone: a.phone,
                    email: a.email,
                    service: a.service,
                    durationMinutes: a.durationMinutes,
                    priceCents: a.priceCents,
                    date: a.date.toISOString().slice(0, 10),
                    time: a.time,
                    notes: a.notes,
                    adminNotes: a.adminNotes,
                    status: a.status,
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

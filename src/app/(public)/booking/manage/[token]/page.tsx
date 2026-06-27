import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ManagePanel } from "./manage-panel";
import { formatTime } from "@/lib/time";

export const metadata: Metadata = { title: "Manage your booking" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending confirmation",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
};

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { manageToken: token },
  });
  if (!appointment) notFound();

  const dateLabel = new Date(appointment.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        Manage your booking
      </h1>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {appointment.service}
          </h2>
          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
            {STATUS_LABEL[appointment.status] ?? appointment.status}
          </span>
        </div>
        <dl className="mt-4 space-y-1 text-sm text-[var(--muted)]">
          <div className="flex justify-between">
            <dt>Date</dt>
            <dd className="text-[var(--foreground)]">{dateLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Time</dt>
            <dd className="text-[var(--foreground)]">
              {formatTime(appointment.time)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Name</dt>
            <dd className="text-[var(--foreground)]">
              {appointment.customerName}
            </dd>
          </div>
        </dl>
      </div>

      <ManagePanel
        token={token}
        status={appointment.status}
        service={appointment.service}
      />
    </div>
  );
}

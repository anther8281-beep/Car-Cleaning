import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireUser();

  const todayStart = new Date(new Date().toISOString().slice(0, 10));

  const [pending, confirmedUpcoming, total, upcoming] = await Promise.all([
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({
      where: { status: "CONFIRMED", date: { gte: todayStart } },
    }),
    prisma.appointment.count(),
    prisma.appointment.findMany({
      where: { date: { gte: todayStart }, status: { in: ["PENDING", "CONFIRMED"] } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Overview
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Signed in as {session.user.email}
        </p>
      </div>

      {!session.user.mfaEnabled ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Two-factor authentication is not enabled.{" "}
          <Link href="/admin-dashboard/setup-mfa" className="font-medium underline">
            Set it up now
          </Link>{" "}
          to secure your account.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Pending requests" value={pending} accent />
        <Stat label="Upcoming confirmed" value={confirmedUpcoming} />
        <Stat label="Total bookings" value={total} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Upcoming appointments
          </h2>
          <Link
            href="/admin-dashboard/appointments"
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {upcoming.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
              No upcoming appointments.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {upcoming.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div>
                    <div className="font-medium text-[var(--foreground)]">
                      {a.customerName} — {a.service}
                    </div>
                    <div className="text-[var(--muted)]">
                      {a.date.toISOString().slice(0, 10)} at {a.time}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      a.status === "PENDING"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {a.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div
        className={`text-3xl font-bold ${
          accent ? "text-[var(--primary)]" : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-sm text-[var(--muted)]">{label}</div>
    </div>
  );
}

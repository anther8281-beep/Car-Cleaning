import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Signed in as {session.user.email}
        </p>
      </div>

      {!session.user.mfaEnabled ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Two-factor authentication is not enabled.{" "}
          <Link
            href="/admin-dashboard/setup-mfa"
            className="font-medium underline"
          >
            Set it up now
          </Link>{" "}
          to secure your account.
        </div>
      ) : null}

      <p className="text-sm text-[var(--muted)]">
        Appointment management and site settings are coming up next.
      </p>
    </div>
  );
}

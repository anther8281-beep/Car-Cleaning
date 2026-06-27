import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/admin-dashboard"
            className="font-semibold text-[var(--foreground)]"
          >
            Admin Dashboard
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--muted)]">{session.user.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-[var(--border)] px-3 py-1 text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

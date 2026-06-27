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

  const navLinks = [
    { href: "/admin-dashboard", label: "Overview" },
    { href: "/admin-dashboard/appointments", label: "Appointments" },
    { href: "/admin-dashboard/settings", label: "Settings" },
    { href: "/admin-dashboard/audit", label: "Audit log" },
  ];

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
            <span className="hidden text-[var(--muted)] sm:inline">
              {session.user.email}
            </span>
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
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

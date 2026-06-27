import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requireUser();
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { email: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Audit log
      </h1>
      <p className="text-sm text-[var(--muted)]">
        The 200 most recent actions and security events.
      </p>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-[var(--muted)]"
                >
                  No activity yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {log.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {log.user?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {log.target ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {log.ipAddress ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

function csvCell(value: string): string {
  // Escape for CSV and neutralize spreadsheet formula injection.
  const v = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${v.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  const header = [
    "Date",
    "Time",
    "Customer",
    "Phone",
    "Email",
    "Service",
    "Status",
    "Notes",
    "Created",
  ];
  const rows = appointments.map((a) =>
    [
      a.date.toISOString().slice(0, 10),
      a.time,
      a.customerName,
      a.phone,
      a.email,
      a.service,
      a.status,
      a.notes ?? "",
      a.createdAt.toISOString(),
    ]
      .map((c) => csvCell(String(c)))
      .join(","),
  );
  const csv = [header.map(csvCell).join(","), ...rows].join("\r\n");

  await logAudit({
    userId: session.user.id,
    action: "appointments.exported",
    metadata: { count: appointments.length },
  });

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="appointments-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}

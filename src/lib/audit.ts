import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

type AuditInput = {
  userId?: string | null;
  action: string;
  target?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
};

/**
 * Append a row to the audit trail. Never throws — auditing must not break the
 * primary operation, so failures are logged and swallowed.
 */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        target: input.target ?? null,
        metadata: input.metadata,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "audit_log_failed",
        action: input.action,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }
}

import { getDb } from "@/db";
import { auditLogs } from "@/db/schema";

export type AuditInput = {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: unknown;
  newValue?: unknown;
};

export async function recordAudit(input: AuditInput) {
  const db = getDb();
  await db.insert(auditLogs).values({
    userId: input.userId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    previousValue:
      input.previousValue !== undefined
        ? JSON.stringify(input.previousValue)
        : null,
    newValue:
      input.newValue !== undefined ? JSON.stringify(input.newValue) : null,
  });
}

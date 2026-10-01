import { desc, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  auditLogs,
  categories,
  parameterDefinitions,
  users,
} from "@/db/schema";
import type { Flower } from "@/domain/flower";
import { getFlowerDataProvider } from "@/providers";

export type AdminDashboardSummary = {
  counts: {
    totalActive: number;
    totalIncludingArchived: number;
    publicVisible: number;
    privateOrDraft: number;
    archived: number;
    categories: number;
    parameterDefinitions: number;
  };
  recentlyUpdated: Flower[];
  recentAudit: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: Date;
    userName: string | null;
    userEmail: string | null;
  }>;
};

export async function listAdminAuditEntries(limit = 50) {
  const db = getDb();
  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      createdAt: auditLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const provider = getFlowerDataProvider();
  const db = getDb();

  const [
    totalActive,
    totalIncludingArchived,
    publicVisible,
    privateOrDraft,
    archived,
    categoryCount,
    parameterCount,
    recentlyUpdated,
    recentAuditRows,
  ] = await Promise.all([
    provider.countFlowers({ includeArchived: false }),
    provider.countFlowers({ includeArchived: true }),
    provider.countFlowers({ publicVisible: true, includeArchived: false }),
    provider.countFlowers({ publicVisible: false, includeArchived: false }),
    provider.countFlowers({ status: "ARCHIVED", includeArchived: true }),
    db.select({ total: count() }).from(categories).then((rows) => Number(rows[0]?.total ?? 0)),
    db
      .select({ total: count() })
      .from(parameterDefinitions)
      .then((rows) => Number(rows[0]?.total ?? 0)),
    provider.getFlowers({
      limit: 6,
      sortBy: "updatedAt",
      sortOrder: "desc",
      includeArchived: true,
    }),
    db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        createdAt: auditLogs.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(8),
  ]);

  return {
    counts: {
      totalActive,
      totalIncludingArchived,
      publicVisible,
      privateOrDraft,
      archived,
      categories: categoryCount,
      parameterDefinitions: parameterCount,
    },
    recentlyUpdated,
    recentAudit: recentAuditRows,
  };
}

import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { flowerRecords, platformSettings, syncEvents } from "@/db/schema";
import type { SourceSystem } from "@/domain/flower";

export type IntegrationStatus = {
  activeDataSource: SourceSystem;
  vegProConfigured: boolean;
  demoMode: boolean;
  integrationConnected: boolean;
  dataSourceLabel: string;
  flowerCountBySource: Record<SourceSystem, number>;
  lastVegProSync: {
    status: string;
    startedAt: Date;
    completedAt: Date | null;
    errorMessage: string | null;
    recordsChanged: number | null;
    eventType: string;
  } | null;
};

export async function getIntegrationStatus(): Promise<IntegrationStatus> {
  const db = getDb();

  const [demoSetting] = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, "demo_mode"))
    .limit(1);

  const [labelSetting] = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, "data_source_label"))
    .limit(1);

  const counts = await db
    .select({
      source: flowerRecords.sourceSystem,
      total: sql<number>`count(*)`,
    })
    .from(flowerRecords)
    .groupBy(flowerRecords.sourceSystem);

  const flowerCountBySource: Record<SourceSystem, number> = {
    Demo: 0,
    VegPro: 0,
  };
  for (const row of counts) {
    flowerCountBySource[row.source] = Number(row.total);
  }

  const [lastVegPro] = await db
    .select()
    .from(syncEvents)
    .where(eq(syncEvents.source, "VegPro"))
    .orderBy(desc(syncEvents.startedAt))
    .limit(1);

  const demoMode = demoSetting?.value !== "false";
  const vegProConfigured = false;

  return {
    activeDataSource: "Demo",
    vegProConfigured,
    demoMode,
    integrationConnected: false,
    dataSourceLabel: labelSetting?.value ?? "Demo Data Provider",
    flowerCountBySource,
    lastVegProSync: lastVegPro
      ? {
          status: lastVegPro.status,
          startedAt: lastVegPro.startedAt,
          completedAt: lastVegPro.completedAt,
          errorMessage: lastVegPro.errorMessage,
          recordsChanged: lastVegPro.recordsChanged,
          eventType: lastVegPro.eventType,
        }
      : null,
  };
}

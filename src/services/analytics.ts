import { headers } from "next/headers";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { analyticsEvents, flowerIdentities } from "@/db/schema";
import { isPublicIdentifier } from "@/lib/public-identifier";

export type AnalyticsRangeDays = 7 | 30 | 90;

export type RecordAnalyticsEventInput = {
  eventType: "PASSPORT_VIEW" | "QR_SCAN";
  publicIdentifier: string;
};

export async function shouldSkipAnalyticsRecording(): Promise<boolean> {
  try {
    const headerList = await headers();
    if (headerList.get("purpose") === "prefetch") {
      return true;
    }
    if (headerList.get("x-middleware-prefetch") === "1") {
      return true;
    }
    if (headerList.get("next-router-prefetch") === "1") {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function resolveFlowerIdentityId(
  publicIdentifier: string,
): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select({ id: flowerIdentities.id })
    .from(flowerIdentities)
    .where(eq(flowerIdentities.publicIdentifier, publicIdentifier))
    .limit(1);
  return rows[0]?.id ?? null;
}

export async function recordEvent(input: RecordAnalyticsEventInput): Promise<void> {
  if (!isPublicIdentifier(input.publicIdentifier)) {
    return;
  }

  const flowerIdentityId = await resolveFlowerIdentityId(input.publicIdentifier);
  if (!flowerIdentityId) {
    return;
  }

  const db = getDb();
  await db.insert(analyticsEvents).values({
    eventType: input.eventType,
    flowerIdentityId,
    sessionHash: null,
    userAgent: null,
    referrer: null,
  });
}

export async function recordPassportView(publicIdentifier: string): Promise<void> {
  if (await shouldSkipAnalyticsRecording()) {
    return;
  }

  await recordEvent({
    eventType: "PASSPORT_VIEW",
    publicIdentifier,
  });
}

export type OperationalAnalyticsSummary = {
  rangeDays: AnalyticsRangeDays;
  rangeStart: Date;
  totalEvents: number;
  passportViews: number;
  qrScanEvents: number;
  uniqueVarietiesViewed: number;
  topVarieties: Array<{ publicIdentifier: string; views: number }>;
  viewsByDay: Array<{ day: string; views: number }>;
  recentActivity: Array<{
    eventType: string;
    publicIdentifier: string | null;
    createdAt: Date;
  }>;
};

function rangeStartDate(days: AnalyticsRangeDays): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

export function parseAnalyticsRangeDays(
  value: string | undefined,
): AnalyticsRangeDays {
  if (value === "7" || value === "90") {
    return Number(value) as AnalyticsRangeDays;
  }
  return 30;
}

export async function getOperationalAnalytics(
  rangeDays: AnalyticsRangeDays,
): Promise<OperationalAnalyticsSummary> {
  const db = getDb();
  const rangeStart = rangeStartDate(rangeDays);
  const rangeFilter = gte(analyticsEvents.createdAt, rangeStart);
  const passportFilter = and(
    rangeFilter,
    eq(analyticsEvents.eventType, "PASSPORT_VIEW"),
  );
  const qrFilter = and(rangeFilter, eq(analyticsEvents.eventType, "QR_SCAN"));

  const [[totalRow], [passportRow], [qrRow], [uniqueRow]] = await Promise.all([
    db.select({ totalEvents: count() }).from(analyticsEvents).where(rangeFilter),
    db
      .select({ passportViews: count() })
      .from(analyticsEvents)
      .where(passportFilter),
    db.select({ qrScanEvents: count() }).from(analyticsEvents).where(qrFilter),
    db
      .select({
        uniqueVarieties: sql<number>`count(distinct ${analyticsEvents.flowerIdentityId})`,
      })
      .from(analyticsEvents)
      .where(
        and(
          rangeFilter,
          eq(analyticsEvents.eventType, "PASSPORT_VIEW"),
          sql`${analyticsEvents.flowerIdentityId} is not null`,
        ),
      ),
  ]);

  const topVarieties = await db
    .select({
      publicIdentifier: flowerIdentities.publicIdentifier,
      views: count(),
    })
    .from(analyticsEvents)
    .innerJoin(
      flowerIdentities,
      eq(analyticsEvents.flowerIdentityId, flowerIdentities.id),
    )
    .where(passportFilter)
    .groupBy(flowerIdentities.publicIdentifier)
    .orderBy(desc(count()))
    .limit(10);

  const viewsByDayRows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${analyticsEvents.createdAt}), 'YYYY-MM-DD')`,
      views: count(),
    })
    .from(analyticsEvents)
    .where(passportFilter)
    .groupBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`)
    .orderBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`);

  const recentActivity = await db
    .select({
      eventType: analyticsEvents.eventType,
      publicIdentifier: flowerIdentities.publicIdentifier,
      createdAt: analyticsEvents.createdAt,
    })
    .from(analyticsEvents)
    .leftJoin(
      flowerIdentities,
      eq(analyticsEvents.flowerIdentityId, flowerIdentities.id),
    )
    .where(rangeFilter)
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(25);

  return {
    rangeDays,
    rangeStart,
    totalEvents: totalRow?.totalEvents ?? 0,
    passportViews: passportRow?.passportViews ?? 0,
    qrScanEvents: qrRow?.qrScanEvents ?? 0,
    uniqueVarietiesViewed: Number(uniqueRow?.uniqueVarieties ?? 0),
    topVarieties: topVarieties.map((row) => ({
      publicIdentifier: row.publicIdentifier,
      views: row.views,
    })),
    viewsByDay: viewsByDayRows.map((row) => ({
      day: row.day,
      views: row.views,
    })),
    recentActivity: recentActivity.map((row) => ({
      eventType: row.eventType,
      publicIdentifier: row.publicIdentifier,
      createdAt: row.createdAt,
    })),
  };
}

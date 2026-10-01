import "../src/env/load-local-env";
import { drizzle } from "drizzle-orm/postgres-js";
import { and, count, eq, gte, sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { analyticsEvents, flowerIdentities, flowerRecords } from "../src/db/schema";

let qaDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
let qaClient: ReturnType<typeof postgres> | undefined;

function getQaDb() {
  if (!qaDb) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    qaClient = postgres(url, { prepare: false, max: 1, idle_timeout: 5 });
    qaDb = drizzle(qaClient, { schema });
  }
  return qaDb;
}

function rangeStartDate(days: 7 | 30 | 90): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

export async function clearAllAnalyticsEvents() {
  const db = getQaDb();
  await db.delete(analyticsEvents);
}

/** Lightweight counts for QA polling (single DB connection). */
export async function countPassportViews(rangeDays: 7 | 30 | 90 = 7) {
  const db = getQaDb();
  const rangeStart = rangeStartDate(rangeDays);
  const passportFilter = and(
    gte(analyticsEvents.createdAt, rangeStart),
    eq(analyticsEvents.eventType, "PASSPORT_VIEW"),
  );

  const [passportRow] = await db
    .select({ passportViews: count() })
    .from(analyticsEvents)
    .where(passportFilter);

  const [uniqueRow] = await db
    .select({
      uniqueVarieties: sql<number>`count(distinct ${analyticsEvents.flowerIdentityId})`,
    })
    .from(analyticsEvents)
    .where(
      and(
        passportFilter,
        sql`${analyticsEvents.flowerIdentityId} is not null`,
      ),
    );

  return {
    passportViews: passportRow?.passportViews ?? 0,
    uniqueVarieties: Number(uniqueRow?.uniqueVarieties ?? 0),
    totalEvents: passportRow?.passportViews ?? 0,
    top: [] as Array<{ publicIdentifier: string; views: number }>,
  };
}

export async function getFlowerRecordIdByPublicIdentifier(
  publicIdentifier: string,
): Promise<string | null> {
  const db = getQaDb();
  const rows = await db
    .select({ id: flowerRecords.id })
    .from(flowerRecords)
    .innerJoin(
      flowerIdentities,
      eq(flowerRecords.flowerIdentityId, flowerIdentities.id),
    )
    .where(eq(flowerIdentities.publicIdentifier, publicIdentifier))
    .limit(1);
  return rows[0]?.id ?? null;
}

export async function closeQaDb() {
  if (qaClient) {
    await qaClient.end({ timeout: 5 });
    qaClient = undefined;
    qaDb = undefined;
  }
}

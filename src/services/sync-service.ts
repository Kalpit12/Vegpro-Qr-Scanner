import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { syncEvents } from "@/db/schema";
import type { SourceSystem } from "@/domain/flower";
import { getSourceAdapter } from "@/integration/registry";
import { IntegrationNotConfiguredError } from "@/integration/errors";
import type { SyncOperationResult, SyncRequest } from "@/integration/types";

function syncEventType(mode: SyncRequest["mode"]): string {
  if (mode === "full") {
    return "full_sync";
  }
  if (mode === "incremental") {
    return "incremental_sync";
  }
  return "single_flower_sync";
}

export async function runSynchronization(
  request: SyncRequest,
): Promise<SyncOperationResult> {
  const db = getDb();
  const startedAt = new Date();
  const adapter = getSourceAdapter(request.source);
  const eventType = syncEventType(request.mode);

  const [pending] = await db
    .insert(syncEvents)
    .values({
      source: request.source,
      eventType,
      externalId: request.externalId ?? null,
      status: "PENDING",
      startedAt,
      recordsChanged: 0,
    })
    .returning();

  try {
    if (request.source === "VegPro" && !adapter.isConfigured()) {
      throw new IntegrationNotConfiguredError();
    }

    const adapterResult = await adapter.pullSync(
      request.mode,
      request.externalId,
    );
    const completedAt = new Date();

    await db
      .update(syncEvents)
      .set({
        status: "SUCCESS",
        completedAt,
        recordsChanged: adapterResult.recordsChanged,
        errorMessage: null,
      })
      .where(eq(syncEvents.id, pending.id));

    return {
      syncEventId: pending.id,
      source: request.source,
      mode: request.mode,
      status: "SUCCESS",
      recordsChanged: adapterResult.recordsChanged,
      summary: adapterResult.summary,
      startedAt,
      completedAt,
    };
  } catch (error) {
    const completedAt = new Date();
    const message =
      error instanceof Error ? error.message : "Synchronization failed";

    await db
      .update(syncEvents)
      .set({
        status: "ERROR",
        completedAt,
        errorMessage: message.slice(0, 2000),
      })
      .where(eq(syncEvents.id, pending.id));

    return {
      syncEventId: pending.id,
      source: request.source,
      mode: request.mode,
      status: "ERROR",
      recordsChanged: 0,
      summary: message,
      errorMessage: message,
      startedAt,
      completedAt,
    };
  }
}

export type { SourceSystem };

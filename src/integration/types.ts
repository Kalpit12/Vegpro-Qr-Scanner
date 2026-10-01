import type { SourceSystem } from "@/domain/flower";

export type SyncMode = "full" | "incremental" | "single";

export type SyncRequest = {
  mode: SyncMode;
  source: SourceSystem;
  /** External source record id for single-flower sync (not publicIdentifier). */
  externalId?: string;
};

export type SyncAdapterResult = {
  recordsChanged: number;
  summary: string;
};

export type SyncOperationResult = {
  syncEventId: string;
  source: SourceSystem;
  mode: SyncMode;
  status: "SUCCESS" | "ERROR";
  recordsChanged: number;
  summary: string;
  errorMessage?: string;
  startedAt: Date;
  completedAt: Date;
};

/** Placeholder shape for a future VegPro payload — fields are not finalized. */
export type VegProFlowerPayload = {
  externalId: string;
  lastUpdatedAt: string;
  [key: string]: unknown;
};

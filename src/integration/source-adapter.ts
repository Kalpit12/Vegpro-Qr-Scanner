import type { SourceSystem } from "@/domain/flower";
import type { SyncAdapterResult, SyncMode } from "./types";

export interface SourceAdapter {
  readonly source: SourceSystem;
  isConfigured(): boolean;
  pullSync(mode: SyncMode, externalId?: string): Promise<SyncAdapterResult>;
}

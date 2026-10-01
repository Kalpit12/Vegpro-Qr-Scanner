import type { SourceAdapter } from "../source-adapter";
import type { SyncAdapterResult, SyncMode } from "../types";

export class DemoSourceAdapter implements SourceAdapter {
  readonly source = "Demo" as const;

  isConfigured(): boolean {
    return true;
  }

  async pullSync(mode: SyncMode, externalId?: string): Promise<SyncAdapterResult> {
    void mode;
    void externalId;
    return {
      recordsChanged: 0,
      summary:
        "Demo source is local PostgreSQL data. No external system to synchronize.",
    };
  }
}

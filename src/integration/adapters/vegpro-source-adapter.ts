import { IntegrationNotConfiguredError } from "../errors";
import type { SourceAdapter } from "../source-adapter";
import type { SyncAdapterResult, SyncMode } from "../types";

export class VegProSourceAdapter implements SourceAdapter {
  readonly source = "VegPro" as const;

  isConfigured(): boolean {
    return false;
  }

  async pullSync(mode: SyncMode, externalId?: string): Promise<SyncAdapterResult> {
    void mode;
    void externalId;
    throw new IntegrationNotConfiguredError(
      "VegPro integration is not configured yet. A real source adapter requires VegPro's API or export contract.",
    );
  }
}

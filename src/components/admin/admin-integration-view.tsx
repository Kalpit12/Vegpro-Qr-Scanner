"use client";

import { useState } from "react";
import type { IntegrationStatus } from "@/services/integration-status";
import { Button } from "@/components/ui/button";

type ClientIntegrationStatus = Omit<IntegrationStatus, "lastVegProSync"> & {
  lastVegProSync: Omit<
    NonNullable<IntegrationStatus["lastVegProSync"]>,
    "startedAt" | "completedAt"
  > & {
    startedAt: string;
    completedAt: string | null;
  } | null;
};

type AdminIntegrationViewProps = {
  status: ClientIntegrationStatus;
};

export function AdminIntegrationView({ status }: AdminIntegrationViewProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestSync(source: "Demo" | "VegPro") {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "full", source }),
      });
      const body = (await response.json()) as {
        data?: { summary: string; status: string };
        error?: string;
      };
      if (!response.ok) {
        setMessage(body.error ?? "Sync request failed.");
        return;
      }
      setMessage(body.data?.summary ?? "Sync completed.");
    } catch {
      setMessage("Sync request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="vegpro-section border border-border p-6">
        <p className="type-editorial-label">Source</p>
        <h2 className="mt-2 type-section-title text-xl">Integration status</h2>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Active data provider</dt>
            <dd className="mt-1 font-medium">{status.dataSourceLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">VegPro connected</dt>
            <dd className="mt-1 font-medium">
              {status.integrationConnected ? "Yes" : "No — integration not configured"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Demo mode</dt>
            <dd className="mt-1 font-medium">{status.demoMode ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Demo records</dt>
            <dd className="mt-1 font-medium">{status.flowerCountBySource.Demo}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">VegPro records</dt>
            <dd className="mt-1 font-medium">{status.flowerCountBySource.VegPro}</dd>
          </div>
        </dl>
      </section>

      <section className="vegpro-section border border-border p-6">
        <p className="type-editorial-label">Synchronization</p>
        <h2 className="mt-2 type-section-title text-xl">Manual sync boundary</h2>
        <p className="mt-2 type-meta max-w-2xl">
          Sync operations record status in <code>sync_events</code>. VegPro requests
          fail clearly until a real connector and contract exist. Demo requests
          confirm that local demo data has no external source.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => requestSync("Demo")}
          >
            Run demo sync check
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => requestSync("VegPro")}
          >
            Request VegPro sync
          </Button>
        </div>
        {message ? (
          <p className="mt-4 text-sm text-foreground" role="status">
            {message}
          </p>
        ) : null}
        {status.lastVegProSync ? (
          <div className="mt-6 border-t border-border pt-4 text-sm">
            <p className="font-medium">Last VegPro sync attempt</p>
            <p className="mt-1 text-muted-foreground">
              {status.lastVegProSync.status} · {status.lastVegProSync.eventType} ·{" "}
              {status.lastVegProSync.startedAt}
            </p>
            {status.lastVegProSync.errorMessage ? (
              <p className="mt-1 text-muted-foreground">
                {status.lastVegProSync.errorMessage}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

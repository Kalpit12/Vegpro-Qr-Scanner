import Link from "next/link";
import type { OperationalAnalyticsSummary } from "@/services/analytics";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ranges = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
] as const;

function MetricCell({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col p-4 sm:p-5">
      <p className="type-metric-label">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums leading-none text-foreground sm:text-4xl">
        {value}
      </p>
      {hint ? <p className="mt-2 type-meta">{hint}</p> : null}
    </div>
  );
}

function formatEventLabel(eventType: string) {
  if (eventType === "PASSPORT_VIEW") return "Passport view";
  if (eventType === "QR_SCAN") return "QR scan";
  return eventType.replaceAll("_", " ").toLowerCase();
}

function ViewsOverTime({ summary }: { summary: OperationalAnalyticsSummary }) {
  const maxViews = Math.max(...summary.viewsByDay.map((row) => row.views), 1);

  if (summary.viewsByDay.length === 0) {
    return <p className="type-meta">No passport views in this period.</p>;
  }

  return (
    <div className="min-w-0 space-y-3">
      <ul className="flex min-w-0 items-end gap-1.5 overflow-x-auto pb-1 sm:gap-2">
        {summary.viewsByDay.map((row) => (
          <li key={row.day} className="flex min-w-[2.25rem] flex-1 flex-col items-center gap-2">
            <span className="sr-only">
              {row.day}: {row.views} views
            </span>
            <div
              className="w-full min-w-[1.5rem] max-w-12 border border-botanical/20 bg-botanical-soft"
              style={{ height: `${Math.max(8, (row.views / maxViews) * 96)}px` }}
              aria-hidden
            />
            <span className="type-meta whitespace-nowrap text-[0.625rem]">
              {row.day.slice(5)}
            </span>
          </li>
        ))}
      </ul>
      <p className="type-meta">Daily passport views (server-recorded).</p>
    </div>
  );
}

export function AdminAnalyticsView({ summary }: { summary: OperationalAnalyticsSummary }) {
  const hasData = summary.totalEvents > 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-2">
        {ranges.map((range) => (
          <Link
            key={range.value}
            href={`/admin/analytics?days=${range.value}`}
            className={cn(
              buttonVariants({
                variant: summary.rangeDays === Number(range.value) ? "secondary" : "outline",
                size: "sm",
              }),
            )}
          >
            {range.label}
          </Link>
        ))}
      </div>

      {!hasData ? (
        <div className="vegpro-section">
          <p className="type-editorial-label">No activity</p>
          <h2 className="mt-2 type-section-title text-xl">No analytics in this period</h2>
          <p className="mt-2 max-w-prose type-body text-muted-foreground">
            Public Flower Passport views are recorded when visitors open a public passport
            route. Open a public passport such as{" "}
            <Link href="/flowers/VP-0001" className="text-botanical underline-offset-2 hover:underline">
              /flowers/VP-0001
            </Link>{" "}
            while signed out, then return here.
          </p>
        </div>
      ) : (
        <>
          <section aria-labelledby="analytics-summary">
            <p id="analytics-summary" className="type-editorial-label mb-3">
              Summary
            </p>
            <div className="grid grid-cols-2 divide-x divide-y divide-border border border-border bg-card md:grid-cols-3">
              <MetricCell label="Passport views" value={summary.passportViews} />
              <MetricCell
                label="Unique varieties"
                value={summary.uniqueVarietiesViewed}
                hint="Distinct VP IDs viewed"
              />
              <MetricCell
                label="QR-attributed"
                value={summary.qrScanEvents}
                hint="Not recorded — scan source not detected"
              />
            </div>
          </section>

          <section aria-labelledby="analytics-over-time">
            <div className="border-b border-border pb-3">
              <h2 id="analytics-over-time" className="type-section-title">
                Views over time
              </h2>
              <p className="mt-1 type-meta">Passport views grouped by day.</p>
            </div>
            <div className="mt-4 border border-border bg-card p-4 sm:p-5">
              <ViewsOverTime summary={summary} />
            </div>
          </section>

          <section aria-labelledby="analytics-top">
            <div className="border-b border-border pb-3">
              <h2 id="analytics-top" className="type-section-title">
                Top viewed varieties
              </h2>
            </div>
            {summary.topVarieties.length === 0 ? (
              <p className="mt-3 type-meta">No variety-level views yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-border border border-border bg-card">
                {summary.topVarieties.map((row) => (
                  <li
                    key={row.publicIdentifier}
                    className="flex min-w-0 items-center justify-between gap-4 px-4 py-3 sm:px-6"
                  >
                    <Link
                      href={`/flowers/${row.publicIdentifier}`}
                      className="font-mono text-sm text-foreground hover:text-botanical"
                    >
                      {row.publicIdentifier}
                    </Link>
                    <span className="type-meta tabular-nums">{row.views} views</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="analytics-recent">
            <div className="border-b border-border pb-3">
              <h2 id="analytics-recent" className="type-section-title">
                Recent activity
              </h2>
            </div>
            <ul className="mt-2 divide-y divide-border border border-border bg-card">
              {summary.recentActivity.map((row, index) => (
                <li
                  key={`${row.createdAt.toISOString()}-${index}`}
                  className="flex min-w-0 flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {formatEventLabel(row.eventType)}
                      {row.publicIdentifier ? (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          · {row.publicIdentifier}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <p className="shrink-0 type-meta">{row.createdAt.toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

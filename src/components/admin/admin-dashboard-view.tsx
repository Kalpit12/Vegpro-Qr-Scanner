import Link from "next/link";
import type { Flower } from "@/domain/flower";
import { buttonVariants } from "@/components/ui/button";
import type { AdminDashboardSummary } from "@/services/admin-dashboard";
import { FlowerIdentityRow } from "@/components/admin/flower-identity-card";

const OPERATIONS_METRICS: {
  key:
    | "totalActive"
    | "publicVisible"
    | "privateOrDraft"
    | "archived"
    | "categories"
    | "parameterDefinitions";
  label: string;
  hint?: string;
}[] = [
  { key: "totalActive", label: "Active varieties" },
  { key: "publicVisible", label: "Public passports", hint: "Visible on /flowers" },
  { key: "privateOrDraft", label: "Not public" },
  { key: "archived", label: "Archived" },
  { key: "categories", label: "Categories" },
  { key: "parameterDefinitions", label: "Parameters" },
];

function EditorialMetric({
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
      {hint ? (
        <p className="mt-2 type-meta">{hint}</p>
      ) : null}
    </div>
  );
}

function RecentVarietyRow({ flower }: { flower: Flower }) {
  return <FlowerIdentityRow flower={flower} />;
}

export function AdminDashboardView({ summary }: { summary: AdminDashboardSummary }) {
  const { counts, recentlyUpdated, recentAudit } = summary;

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="dashboard-operations">
        <p id="dashboard-operations" className="type-editorial-label mb-3">
          Operations
        </p>
        <div className="grid grid-cols-2 divide-x divide-y divide-border border border-border bg-card md:grid-cols-3">
          {OPERATIONS_METRICS.map((metric) => (
            <EditorialMetric
              key={metric.label}
              label={metric.label}
              value={counts[metric.key]}
              hint={metric.hint}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="dashboard-recent-varieties">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <p className="type-editorial-label mb-1">Recently updated</p>
            <h2 id="dashboard-recent-varieties" className="type-section-title">
              Catalog specimens
            </h2>
            <p className="mt-1 type-meta">
              Latest variety identities from the database — image, code, and VP ID.
            </p>
          </div>
          <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/admin/flowers">
            View all varieties
          </Link>
        </div>
        {recentlyUpdated.length === 0 ? (
          <p className="mt-3 type-meta">No varieties yet.</p>
        ) : (
          <ul className="mt-2 border-x border-b border-border bg-background px-4 sm:px-6">
            {recentlyUpdated.map((flower) => (
              <RecentVarietyRow key={flower.id} flower={flower} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="dashboard-audit">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 id="dashboard-audit" className="type-section-title">
              Recent administrative activity
            </h2>
            <p className="mt-1 type-meta">Existing audit log entries only.</p>
          </div>
          <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/admin/audit">
            Full audit log
          </Link>
        </div>
        {recentAudit.length === 0 ? (
          <p className="mt-3 type-meta">
            No audit entries yet. Catalog and variety changes will appear here.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border border border-border bg-card">
            {recentAudit.map((entry) => (
              <li
                key={entry.id}
                className="flex min-w-0 flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {entry.action}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {entry.entityType}
                    </span>
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {entry.entityId}
                  </p>
                </div>
                <div className="shrink-0 type-meta">
                  <p>{entry.userName ?? entry.userEmail ?? "System"}</p>
                  <p>{entry.createdAt.toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

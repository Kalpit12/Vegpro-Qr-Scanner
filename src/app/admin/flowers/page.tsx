import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/authz";
import { DEVELOPMENT_STAGE_LABELS } from "@/domain/enums";
import type { FlowerStatus } from "@/domain/flower";
import { getFlowerDataProvider } from "@/providers";
import { listCategories } from "@/services/catalog-write";
import { PageShell, EmptyState } from "@/components/design/page-shell";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlowersFilters } from "@/components/admin/flowers-filters";
import { FlowersPagination } from "@/components/admin/flowers-pagination";
import { VarietyStatusBadges } from "@/components/admin/variety-status-badges";
import { FlowerIdentityCard } from "@/components/admin/flower-identity-card";
import { FlowersViewToggle } from "@/components/admin/flowers-view-toggle";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function AdminFlowersPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/flowers");
  }

  const params = await searchParams;
  const page = Number(param(params.page) ?? "1");
  const pageSize = 20;
  const provider = getFlowerDataProvider();
  const categories = await listCategories(true);

  const query = {
    search: param(params.search),
    status: param(params.status) as FlowerStatus | undefined,
    categoryId: param(params.categoryId),
    publicVisible:
      param(params.publicVisible) === "true"
        ? true
        : param(params.publicVisible) === "false"
          ? false
          : undefined,
    includeArchived: param(params.includeArchived) === "true",
    sortBy: (param(params.sortBy) as "name" | "varietyCode" | "updatedAt" | undefined) ?? "updatedAt",
    sortOrder: (param(params.sortOrder) as "asc" | "desc" | undefined) ?? "desc",
  };

  const [flowers, total] = await Promise.all([
    provider.getFlowers({ ...query, limit: pageSize, offset: (page - 1) * pageSize }),
    provider.countFlowers(query),
  ]);

  const canCreate = hasRole(session, ["ADMIN", "BREEDER"]);
  const viewMode = param(params.view) === "list" ? "list" : "grid";

  return (
    <PageShell
      eyebrow="Flower collection"
      title="Flower varieties"
      description="Manage the digital identities and public passports for each variety."
      actions={
        canCreate ? (
          <Link className={buttonVariants()} href="/admin/flowers/new">
            Create variety
          </Link>
        ) : undefined
      }
    >
      <FlowersFilters
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        defaults={params}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <p className="type-meta">
          {total} {total === 1 ? "variety" : "varieties"}
        </p>
        <Suspense fallback={null}>
          <FlowersViewToggle />
        </Suspense>
      </div>

      {flowers.length === 0 ? (
        <EmptyState
          badge="No data"
          title="No varieties match your filters"
          description="Adjust filters or create a new demo variety. Metrics and rows use real database values only."
          actionHref={canCreate ? "/admin/flowers/new" : undefined}
          actionLabel={canCreate ? "Create variety" : undefined}
        />
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {flowers.map((flower) => (
                <FlowerIdentityCard key={flower.id} flower={flower} />
              ))}
            </div>
          ) : (
            <>
          <div className="vegpro-table-wrap hidden min-w-0 md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Variety</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flowers.map((flower) => (
                  <TableRow key={flower.id}>
                    <TableCell className="align-top">
                      <div className="font-display text-lg leading-snug text-foreground">{flower.name}</div>
                      <div className="type-meta font-mono">
                        {flower.publicIdentifier} · {flower.varietyCode}
                      </div>
                      <div className="mt-2">
                        <VarietyStatusBadges flower={flower} />
                      </div>
                    </TableCell>
                    <TableCell>{flower.flowerType ?? "—"}</TableCell>
                    <TableCell>{flower.category}</TableCell>
                    <TableCell>
                      {flower.developmentStage
                        ? DEVELOPMENT_STAGE_LABELS[flower.developmentStage]
                        : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(flower.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <Link
                          className={buttonVariants({ size: "sm" })}
                          href={`/admin/flowers/${flower.publicIdentifier}`}
                        >
                          Edit
                        </Link>
                        <Link
                          className={buttonVariants({ variant: "ghost", size: "sm" })}
                          href={`/flowers/${flower.publicIdentifier}`}
                        >
                          Preview
                        </Link>
                        <Link
                          className={buttonVariants({ variant: "link", size: "sm" })}
                          href={`/admin/flowers/${flower.publicIdentifier}#qr`}
                        >
                          QR
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 md:hidden">
            {flowers.map((flower) => (
              <div key={flower.id} className="border border-border bg-background p-4">
                <p className="font-display text-xl leading-snug">{flower.name}</p>
                <p className="type-meta font-mono">
                  {flower.publicIdentifier} · {flower.varietyCode}
                </p>
                <div className="mt-3">
                  <VarietyStatusBadges flower={flower} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-muted-foreground">Code</dt><dd>{flower.varietyCode}</dd></div>
                  <div><dt className="text-muted-foreground">Category</dt><dd>{flower.category}</dd></div>
                  <div><dt className="text-muted-foreground">Public</dt><dd>{flower.publicVisible ? "Yes" : "No"}</dd></div>
                  <div><dt className="text-muted-foreground">Updated</dt><dd>{new Date(flower.updatedAt).toLocaleDateString()}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className={buttonVariants({ size: "sm" })} href={`/admin/flowers/${flower.publicIdentifier}`}>Edit</Link>
                  <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href={`/flowers/${flower.publicIdentifier}`}>Preview</Link>
                  <Link className={buttonVariants({ variant: "link", size: "sm" })} href={`/admin/flowers/${flower.publicIdentifier}#qr`}>QR</Link>
                </div>
              </div>
            ))}
          </div>
            </>
          )}

          <FlowersPagination
            page={page}
            pageSize={pageSize}
            total={total}
            searchParams={params}
          />
        </>
      )}
    </PageShell>
  );
}

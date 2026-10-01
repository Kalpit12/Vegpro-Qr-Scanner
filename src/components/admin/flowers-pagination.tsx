import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FlowersPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  searchParams: Record<string, string | string[] | undefined>;
};

function buildQuery(
  params: Record<string, string | string[] | undefined>,
  page: number,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else {
      query.set(key, value);
    }
  }
  query.set("page", String(page));
  return query.toString();
}

export function FlowersPagination({
  page,
  pageSize,
  total,
  searchParams,
}: FlowersPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  if (totalPages <= 1) {
    return (
      <p className="text-sm text-muted-foreground">{total} varieties</p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {total} varieties
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/flowers?${buildQuery(searchParams, page - 1)}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            !hasPrev && "pointer-events-none opacity-50",
          )}
          aria-disabled={!hasPrev}
        >
          Previous
        </Link>
        <Link
          href={`/admin/flowers?${buildQuery(searchParams, page + 1)}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            !hasNext && "pointer-events-none opacity-50",
          )}
          aria-disabled={!hasNext}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

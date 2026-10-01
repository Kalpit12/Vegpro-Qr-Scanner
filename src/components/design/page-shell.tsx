import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  actions,
}: PageShellProps) {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="space-y-3 border-b border-border pb-8">
        {eyebrow ? <p className="type-editorial-label">{eyebrow}</p> : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="type-page-title">{title}</h1>
            {description ? (
              <p className="max-w-2xl type-body text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
      </header>
      {children}
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
  badge?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  badge,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="vegpro-section border-dashed">
      {badge ? (
        <Badge variant="outline" className="mb-3 rounded-full normal-case tracking-normal">
          {badge}
        </Badge>
      ) : null}
      <h2 className="type-section-title text-xl">{title}</h2>
      <p className="mt-2 type-body text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Link className={buttonVariants({ variant: "outline" })} href={actionHref}>
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  EmptyState,
  PageShell,
} from "@/components/design/page-shell";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col bg-[linear-gradient(180deg,oklch(0.99_0.01_145),oklch(1_0_0))]">
      <PageShell
        eyebrow="VegPro"
        title="Digital Flower Passport"
        description="Foundation platform for permanent variety identity, demo data integration, and future VegPro synchronization."
        actions={
          <Badge variant="outline" className="w-fit">
            Phase 1 foundation
          </Badge>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState
            badge="Public"
            title="Flower Passport routes"
            description="Public passport pages will resolve stable identifiers such as /flowers/VP-0001 without exposing internal database IDs."
            actionHref="/flowers/VP-0001"
            actionLabel="Open placeholder passport"
          />
          <EmptyState
            badge="Internal"
            title="Admin foundation"
            description="Authentication, roles, and variety APIs are in place. Full admin workflows arrive in later phases."
            actionHref="/login?callbackUrl=/admin"
            actionLabel="Admin sign in"
          />
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link className={buttonVariants({ variant: "secondary" })} href="/admin/flowers">
            Varieties shell
          </Link>
          <Link className={buttonVariants({ variant: "ghost" })} href="/api/public/flowers/VP-0001">
            Public API sample
          </Link>
        </div>
      </PageShell>
    </main>
  );
}

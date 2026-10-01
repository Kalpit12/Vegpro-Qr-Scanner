import Link from "next/link";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/authz";
import { PageShell } from "@/components/design/page-shell";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { buttonVariants } from "@/components/ui/button";
import { getAdminDashboardSummary } from "@/services/admin-dashboard";

export default async function AdminHomePage() {
  const session = await auth();
  const summary = await getAdminDashboardSummary();
  const canCreate = hasRole(session, ["ADMIN", "BREEDER"]);

  return (
    <PageShell
      eyebrow="Dashboard"
      title="Operations overview"
      description="Live counts from the demo database and provider. No fabricated analytics."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link className={buttonVariants({ variant: "outline" })} href="/admin/analytics">
            Passport analytics
          </Link>
          {canCreate ? (
            <Link className={buttonVariants()} href="/admin/flowers/new">
              Create variety
            </Link>
          ) : null}
        </div>
      }
    >
      <AdminDashboardView summary={summary} />
    </PageShell>
  );
}

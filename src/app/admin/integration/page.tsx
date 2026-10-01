import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/authz";
import { PageShell } from "@/components/design/page-shell";
import { AdminIntegrationView } from "@/components/admin/admin-integration-view";
import { getIntegrationStatus } from "@/services/integration-status";

export default async function AdminIntegrationPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/integration");
  }
  if (!hasRole(session, ["ADMIN"])) {
    redirect("/admin");
  }

  const status = await getIntegrationStatus();

  const clientStatus = {
    ...status,
    lastVegProSync: status.lastVegProSync
      ? {
          ...status.lastVegProSync,
          startedAt: status.lastVegProSync.startedAt.toISOString(),
          completedAt:
            status.lastVegProSync.completedAt?.toISOString() ?? null,
        }
      : null,
  };

  return (
    <PageShell
      eyebrow="Governance"
      title="Integration"
      description="VegPro integration is not configured yet. This surface shows source status and sync boundaries only."
    >
      <AdminIntegrationView status={clientStatus} />
    </PageShell>
  );
}

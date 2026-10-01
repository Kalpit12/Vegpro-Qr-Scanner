import { PageShell } from "@/components/design/page-shell";
import { ParametersManager } from "@/components/admin/parameters-manager";
import { listParameterDefinitions } from "@/services/catalog-write";

export default async function AdminParametersPage() {
  const items = await listParameterDefinitions();

  return (
    <PageShell
      eyebrow="Catalog"
      title="Parameter definitions"
      description="Configure flexible variety parameters, public visibility, and validation rules for staff-friendly forms."
    >
      <ParametersManager initialItems={items} />
    </PageShell>
  );
}

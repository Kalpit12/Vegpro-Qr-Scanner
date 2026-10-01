import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/authz";
import { PageShell } from "@/components/design/page-shell";
import { VarietyForm } from "@/components/admin/variety-form";
import { listCategories, listParameterDefinitions } from "@/services/catalog-write";
import { getFlowerDataProvider } from "@/providers";

export default async function NewVarietyPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/flowers/new");
  }
  if (!hasRole(session, ["ADMIN", "BREEDER"])) {
    redirect("/admin/flowers");
  }

  const [categories, parameterDefinitions, allFlowers] = await Promise.all([
    listCategories(true),
    listParameterDefinitions(true),
    getFlowerDataProvider().getFlowers({
      includeArchived: true,
      limit: 200,
      sortBy: "name",
    }),
  ]);

  const varietyOptions = allFlowers.map((item) => ({
    recordId: item.id,
    publicIdentifier: item.publicIdentifier,
    name: item.name,
    varietyCode: item.varietyCode,
  }));

  return (
    <PageShell
      eyebrow="Create"
      title="New variety"
      description="Creates a demo-backed variety with a sequence-allocated public identifier."
    >
      <div className="vegpro-form-width">
        <VarietyForm
          mode="create"
          categories={categories}
          parameterDefinitions={parameterDefinitions}
          varietyOptions={varietyOptions}
        />
      </div>
    </PageShell>
  );
}

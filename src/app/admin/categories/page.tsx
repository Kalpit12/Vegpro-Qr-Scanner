import { PageShell } from "@/components/design/page-shell";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { listCategories } from "@/services/catalog-write";

export default async function AdminCategoriesPage() {
  const items = await listCategories();

  return (
    <PageShell
      eyebrow="Catalog"
      title="Categories"
      description="Manage demo categories used by variety records. Changes are audited server-side."
    >
      <CategoriesManager initialItems={items} />
    </PageShell>
  );
}

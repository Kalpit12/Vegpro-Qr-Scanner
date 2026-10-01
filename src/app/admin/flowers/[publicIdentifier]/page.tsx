import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/authz";
import { getFlowerDataProvider } from "@/providers";
import { VarietyEditHeader } from "@/components/admin/variety-edit-header";
import { VarietyForm } from "@/components/admin/variety-form";
import { ArchiveVarietyButton } from "@/components/admin/archive-variety-button";
import { FlowerQrPanel } from "@/components/admin/flower-qr-panel";
import { generateFlowerQrDataUrl } from "@/services/qr";
import { buildFlowerPublicPath, buildFlowerPublicUrl } from "@/lib/flower-public-url";
import { listCategories, listParameterDefinitions } from "@/services/catalog-write";
import { buttonVariants } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ publicIdentifier: string }>;
};

export default async function EditVarietyPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/admin/flowers`);
  }

  const { publicIdentifier } = await params;
  const provider = getFlowerDataProvider();
  const flower = await provider.getFlowerByPublicIdentifier(publicIdentifier);

  if (!flower) {
    notFound();
  }

  const canEdit = hasRole(session, ["ADMIN", "BREEDER"]);
  const [categories, parameterDefinitions, allFlowers] = await Promise.all([
    listCategories(true),
    listParameterDefinitions(true),
    provider.getFlowers({ includeArchived: true, limit: 200, sortBy: "name" }),
  ]);

  const varietyOptions = allFlowers.map((item) => ({
    recordId: item.id,
    publicIdentifier: item.publicIdentifier,
    name: item.name,
    varietyCode: item.varietyCode,
  }));

  const qrPreviewDataUrl = await generateFlowerQrDataUrl(flower.publicIdentifier);
  const publicUrl = buildFlowerPublicUrl(flower.publicIdentifier);
  const publicPath = buildFlowerPublicPath(flower.publicIdentifier);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <VarietyEditHeader
        flower={flower}
        actions={
          <>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href={`/flowers/${flower.publicIdentifier}`}
            >
              Preview Passport
            </Link>
            {canEdit && flower.status !== "ARCHIVED" ? (
              <ArchiveVarietyButton recordId={flower.id} />
            ) : null}
          </>
        }
      />

      <FlowerQrPanel
        variant="supporting"
        publicIdentifier={flower.publicIdentifier}
        publicUrl={publicUrl}
        publicPath={publicPath}
        varietyName={flower.name}
        varietyCode={flower.varietyCode}
        qrPreviewDataUrl={qrPreviewDataUrl}
      />

      <section aria-labelledby="edit-workflow-heading" className="min-w-0 border-t border-border pt-6">
        <h2 id="edit-workflow-heading" className="sr-only">
          Variety edit workflow
        </h2>
        <div className="vegpro-form-width max-w-none lg:max-w-4xl">
          <VarietyForm
            mode="edit"
            readOnly={!canEdit}
            recordId={flower.id}
            publicIdentifier={flower.publicIdentifier}
            initialFlower={flower}
            categories={categories}
            parameterDefinitions={parameterDefinitions}
            varietyOptions={varietyOptions}
          />
        </div>
      </section>
    </div>
  );
}

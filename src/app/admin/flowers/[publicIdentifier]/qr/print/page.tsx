import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/authz";
import { buildFlowerPublicUrl } from "@/lib/flower-public-url";
import { getFlowerDataProvider } from "@/providers";
import { generateFlowerQrSvg } from "@/services/qr";
import { PrintPageActions } from "@/components/admin/print-page-actions";

type PageProps = {
  params: Promise<{ publicIdentifier: string }>;
};

export default async function FlowerQrPrintPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || !hasRole(session, ["ADMIN", "BREEDER", "VIEWER"])) {
    redirect("/login");
  }

  const { publicIdentifier } = await params;
  const provider = getFlowerDataProvider();
  const flower = await provider.getFlowerByPublicIdentifier(publicIdentifier);

  if (!flower) {
    notFound();
  }

  const svg = await generateFlowerQrSvg(publicIdentifier);
  const publicUrl = buildFlowerPublicUrl(publicIdentifier);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-white p-8 text-black print:min-h-0 print:p-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em]">VegPro</p>
        <h1 className="mt-2 text-xl font-semibold">Digital Flower Passport</h1>
      </div>
      <div
        className="[&_svg]:h-auto [&_svg]:w-64"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="space-y-1 text-center text-sm">
        <p className="text-lg font-medium">{flower.name}</p>
        <p>{flower.varietyCode}</p>
        <p className="font-mono text-base">{flower.publicIdentifier}</p>
        <p className="break-all text-xs text-neutral-600">{publicUrl}</p>
      </div>
      <PrintPageActions />
      <style>{`
        @media print {
          @page { margin: 12mm; }
          body { background: white; }
        }
      `}</style>
    </main>
  );
}

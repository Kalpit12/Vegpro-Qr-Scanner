import type { Metadata } from "next";
import { after } from "next/server";
import { FlowerPassportView } from "@/components/passport/flower-passport-view";
import {
  PassportInvalidState,
  PassportNotAvailableState,
  PassportUnavailableState,
} from "@/components/passport/passport-states";
import { buildFlowerPublicUrl } from "@/lib/flower-public-url";
import { loadPublicPassport } from "@/services/public-passport";
import { recordEvent, shouldSkipAnalyticsRecording } from "@/services/analytics";

type PageProps = {
  params: Promise<{ publicIdentifier: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { publicIdentifier } = await params;
  const result = await loadPublicPassport(publicIdentifier);

  if (result.kind !== "ready") {
    return {
      title: "Flower Passport · VegPro",
      description: "VegPro Digital Flower Passport public variety record.",
      robots: { index: false, follow: false },
    };
  }

  const flower = result.flower;
  const title = `${flower.name} · ${flower.publicIdentifier}`;
  const description =
    flower.shortDescription ??
    flower.description?.slice(0, 160) ??
    `Public flower passport for ${flower.name}.`;
  const canonical = buildFlowerPublicUrl(flower.publicIdentifier);
  const primaryImage = flower.images.find((image) => image.isPrimary) ??
    flower.images[0];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · VegPro Digital Flower Passport`,
      description,
      url: canonical,
      type: "website",
      ...(primaryImage
        ? {
            images: [
              {
                url: primaryImage.url,
                alt: primaryImage.altText ?? flower.name,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function FlowerPassportPage({ params }: PageProps) {
  const { publicIdentifier } = await params;
  const result = await loadPublicPassport(publicIdentifier);

  if (result.kind === "invalid_identifier") {
    return <PassportInvalidState />;
  }

  if (result.kind === "not_available") {
    return <PassportNotAvailableState />;
  }

  if (result.kind === "unavailable") {
    return <PassportUnavailableState />;
  }

  const skipAnalytics = await shouldSkipAnalyticsRecording();

  after(() => {
    if (skipAnalytics) {
      return;
    }
    recordEvent({
      eventType: "PASSPORT_VIEW",
      publicIdentifier,
    }).catch(() => {});
  });

  return (
    <main className="flex w-full min-w-0 flex-1 flex-col">
      <FlowerPassportView flower={result.flower} />
    </main>
  );
}

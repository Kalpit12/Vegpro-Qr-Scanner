import type { PublicFlower, PublicFlowerImage } from "@/domain/flower";
import {
  formatPublicParameterValue,
  groupPublicParameters,
} from "@/lib/format-public-parameter-value";
import {
  formatPassportTimestamp,
  getPassportVerificationLabel,
  getPublicStatusLabel,
} from "@/components/passport/passport-status";
import { PassportImage } from "@/components/passport/passport-image";

const SECTION =
  "mx-auto w-full min-w-0 max-w-3xl px-4 sm:max-w-[40rem] sm:px-6 lg:max-w-4xl lg:px-8";

function sortPublicImages(images: PublicFlowerImage[]) {
  return [...images].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) {
      return left.isPrimary ? -1 : 1;
    }
    return left.displayOrder - right.displayOrder;
  });
}

function PassportHeader({ flower }: { flower: PublicFlower }) {
  const verification = getPassportVerificationLabel(
    flower.source.system,
    flower.status,
  );

  return (
    <header className="border-b border-border/80 bg-background">
      <div className={`${SECTION} flex flex-col gap-4 py-4 sm:py-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-0.5">
            <p className="type-editorial-label">VegPro</p>
            <p className="text-sm font-medium text-foreground sm:text-base">
              Digital Flower Passport
            </p>
          </div>
          <div
            className="w-full min-w-0 rounded-sm border border-border bg-muted/30 px-3 py-2.5 sm:max-w-xs sm:text-right"
            role="status"
          >
            <p className="text-xs font-medium text-foreground">
              {verification.title}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {verification.detail}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2 lg:grid-cols-4">
          <div className="min-w-0">
            <dt className="text-muted-foreground">Variety</dt>
            <dd className="truncate font-medium text-foreground">{flower.name}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Code</dt>
            <dd className="break-all font-mono text-foreground">
              {flower.varietyCode}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Public ID</dt>
            <dd className="break-all font-mono text-foreground">
              {flower.publicIdentifier}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium text-foreground">
              {getPublicStatusLabel(flower.status)}
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

function PassportHero({
  flower,
  primaryImage,
}: {
  flower: PublicFlower;
  primaryImage: PublicFlowerImage | null;
}) {
  const imageAlt =
    primaryImage?.altText?.replace(/\bdemo image\b/i, "photograph") ??
    `${flower.name} primary photograph`;

  return (
    <section
      aria-labelledby="passport-hero-heading"
      className="border-b border-border/80"
    >
      <div
        className={`${SECTION} grid min-w-0 gap-6 py-6 sm:gap-8 sm:py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-10 lg:py-10`}
      >
        {primaryImage ? (
          <PassportImage
            src={primaryImage.url}
            alt={imageAlt}
            priority
            sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 45vw, 480px"
            wrapperClassName="relative aspect-[3/4] w-full max-h-[min(72vh,26rem)] sm:max-h-[min(68vh,28rem)] lg:aspect-[4/5] lg:max-h-none border border-border/80"
            fallbackLabel="Primary photograph unavailable"
          />
        ) : (
          <div className="flex aspect-[3/4] w-full max-h-[min(72vh,26rem)] items-center justify-center border border-dashed border-border bg-muted/50 px-6 text-center text-sm text-muted-foreground lg:max-h-none">
            No public image available for this variety.
          </div>
        )}

        <div className="flex min-w-0 flex-col justify-center lg:py-2">
          <p className="type-editorial-label">
            {flower.category}
            {flower.flowerType && flower.flowerType !== flower.category
              ? ` · ${flower.flowerType}`
              : null}
          </p>
          <h1
            id="passport-hero-heading"
            className="mt-2 font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {flower.name}
          </h1>
          <p className="mt-3 break-words font-mono text-xs text-muted-foreground sm:text-sm">
            <span className="text-foreground/80">{flower.publicIdentifier}</span>
            <span aria-hidden="true"> · </span>
            <span>{flower.varietyCode}</span>
          </p>
          {flower.shortDescription ? (
            <p className="mt-5 text-base leading-relaxed text-foreground/90 sm:text-[1.0625rem]">
              {flower.shortDescription}
            </p>
          ) : null}
          {flower.featured ? (
            <p className="mt-5 inline-flex w-fit max-w-full rounded-sm border border-border px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
              Featured variety
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PassportParameters({ flower }: { flower: PublicFlower }) {
  const groups = groupPublicParameters(flower.parameters);

  if (groups.length === 0) {
    return (
      <section
        aria-labelledby="passport-parameters-heading"
        className="border-b border-border/80"
      >
        <div className={`${SECTION} py-8 sm:py-10`}>
          <h2
            id="passport-parameters-heading"
            className="type-section-title text-lg sm:text-xl"
          >
            Parameters
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            No public parameters are published for this variety yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="passport-parameters-heading"
      className="border-b border-border/80"
    >
      <div className={`${SECTION} py-8 sm:py-10`}>
        <h2
          id="passport-parameters-heading"
          className="type-section-title text-lg sm:text-xl"
        >
          Key parameters
        </h2>
        <div className="mt-6 space-y-9 sm:mt-8 sm:space-y-10">
          {groups.map(([category, parameters]) => {
            const isKeyGroup = category === "Key Parameters";

            return (
              <div key={category} className="min-w-0">
                <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {category}
                </h3>
                {isKeyGroup ? (
                  <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {parameters.map((parameter) => (
                      <div
                        key={parameter.key}
                        className="min-w-0 border border-border/80 bg-background px-4 py-3.5 sm:py-4"
                      >
                        <dt className="text-xs text-muted-foreground">
                          {parameter.name}
                        </dt>
                        <dd className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">
                          {formatPublicParameterValue(parameter)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <dl className="mt-4 divide-y divide-border border-y border-border">
                    {parameters.map((parameter) => (
                      <div
                        key={parameter.key}
                        className="grid min-w-0 grid-cols-1 gap-1 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-4 sm:py-3"
                      >
                        <dt className="text-sm text-muted-foreground">
                          {parameter.name}
                        </dt>
                        <dd className="text-sm font-medium text-foreground sm:text-right">
                          {formatPublicParameterValue(parameter)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PassportDescription({ flower }: { flower: PublicFlower }) {
  if (!flower.description) {
    return null;
  }

  return (
    <section
      aria-labelledby="passport-description-heading"
      className="border-b border-border/80"
    >
      <div className={`${SECTION} py-8 sm:py-10`}>
        <h2
          id="passport-description-heading"
          className="type-section-title text-lg sm:text-xl"
        >
          Description
        </h2>
        <p className="mt-4 text-base leading-relaxed text-foreground/90 sm:text-[1.0625rem]">
          {flower.description}
        </p>
      </div>
    </section>
  );
}

function PassportBreeding({ flower }: { flower: PublicFlower }) {
  const hasBreedingContent =
    flower.breeding &&
    (flower.breeding.origin ||
      flower.breeding.breeder ||
      flower.breeding.breedingProgram ||
      flower.breeding.breedingYear ||
      flower.breeding.publicSummary);

  const hasRelations = flower.varietyRelations.length > 0;

  if (!hasBreedingContent && !hasRelations) {
    return null;
  }

  return (
    <section
      aria-labelledby="passport-breeding-heading"
      className="border-b border-border/80"
    >
      <div className={`${SECTION} py-8 sm:py-10`}>
        <h2
          id="passport-breeding-heading"
          className="type-section-title text-lg sm:text-xl"
        >
          Origin &amp; breeding
        </h2>
        {hasBreedingContent ? (
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            {flower.breeding?.origin ? (
              <div>
                <dt className="text-muted-foreground">Origin</dt>
                <dd className="mt-1 text-foreground">{flower.breeding.origin}</dd>
              </div>
            ) : null}
            {flower.breeding?.breeder ? (
              <div>
                <dt className="text-muted-foreground">Breeder</dt>
                <dd className="mt-1 text-foreground">{flower.breeding.breeder}</dd>
              </div>
            ) : null}
            {flower.breeding?.breedingProgram ? (
              <div>
                <dt className="text-muted-foreground">Breeding program</dt>
                <dd className="mt-1 text-foreground">
                  {flower.breeding.breedingProgram}
                </dd>
              </div>
            ) : null}
            {flower.breeding?.breedingYear ? (
              <div>
                <dt className="text-muted-foreground">Breeding year</dt>
                <dd className="mt-1 text-foreground">
                  {flower.breeding.breedingYear}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        {flower.breeding?.publicSummary ? (
          <p className="mt-6 text-base leading-relaxed text-foreground/90 sm:text-[1.0625rem]">
            {flower.breeding.publicSummary}
          </p>
        ) : null}
        {hasRelations ? (
          <div className="mt-8 border-t border-border/60 pt-6">
            <h3 className="text-sm font-medium text-foreground">
              Related varieties
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {flower.varietyRelations.map((relation) => (
                <li key={`${relation.relationType}-${relation.publicIdentifier}`}>
                  <span className="text-muted-foreground">
                    {relation.relationType === "RELATED_TO"
                      ? "Related to"
                      : relation.relatedVarietyIsParent
                        ? "Parent variety"
                        : "Offspring"}
                    {": "}
                  </span>
                  <span className="font-medium text-foreground">
                    {relation.name}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    ({relation.varietyCode} · {relation.publicIdentifier})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PassportGallery({
  flower,
  images,
  primaryImage,
}: {
  flower: PublicFlower;
  images: PublicFlowerImage[];
  primaryImage: PublicFlowerImage | null;
}) {
  const galleryImages = images.filter(
    (image) => !primaryImage || image.url !== primaryImage.url,
  );

  if (galleryImages.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="passport-gallery-heading"
      className="border-b border-border/80"
    >
      <div className={`${SECTION} py-8 sm:py-10`}>
        <h2
          id="passport-gallery-heading"
          className="type-section-title text-lg sm:text-xl"
        >
          Gallery
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {galleryImages.map((image, index) => (
            <li key={`${image.url}-${index}`} className="min-w-0">
              <PassportImage
                src={image.url}
                alt={
                  image.altText ?? `${flower.name} photograph ${index + 1}`
                }
                sizes="(max-width: 640px) 100vw, 400px"
                wrapperClassName="relative aspect-[4/3] w-full border border-border/80"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PassportMetadata({ flower }: { flower: PublicFlower }) {
  return (
    <footer className="bg-muted/25">
      <div className={`${SECTION} py-7 sm:py-8`}>
        <h2 className="sr-only">Passport metadata</h2>
        <dl className="grid min-w-0 gap-4 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-muted-foreground">Last updated</dt>
            <dd className="mt-1 font-medium text-foreground">
              {formatPassportTimestamp(flower.source.lastUpdatedAt)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Data source</dt>
            <dd className="mt-1 font-medium text-foreground">
              {flower.source.system === "Demo"
                ? "Demo dataset (not live VegPro synchronization)"
                : "VegPro"}
            </dd>
          </div>
        </dl>
      </div>
    </footer>
  );
}

export function FlowerPassportView({ flower }: { flower: PublicFlower }) {
  const images = sortPublicImages(flower.images);
  const primaryImage =
    images.find((image) => image.isPrimary) ?? images[0] ?? null;

  return (
    <article className="flex w-full min-w-0 flex-1 flex-col">
      <PassportHeader flower={flower} />
      <PassportHero flower={flower} primaryImage={primaryImage} />
      <PassportParameters flower={flower} />
      <PassportDescription flower={flower} />
      <PassportBreeding flower={flower} />
      <PassportGallery
        flower={flower}
        images={images}
        primaryImage={primaryImage}
      />
      <PassportMetadata flower={flower} />
    </article>
  );
}

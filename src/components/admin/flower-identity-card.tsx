import Link from "next/link";
import type { Flower } from "@/domain/flower";
import { FLOWER_STATUS_LABELS } from "@/domain/enums";
import { PassportImage } from "@/components/passport/passport-image";
import {
  getFlowerImageAlt,
  getFlowerPrimaryImageUrl,
} from "@/lib/get-flower-display-image";

type FlowerIdentityCardProps = {
  flower: Flower;
  /** Dashboard rows show updated timestamp; catalog cards omit it. */
  showUpdated?: boolean;
};

function statusLine(flower: Flower) {
  const status = FLOWER_STATUS_LABELS[flower.status];
  const visibility = flower.publicVisible ? "Public" : "Private";
  return `${status} · ${visibility}`;
}

export function FlowerIdentityCard({
  flower,
  showUpdated = false,
}: FlowerIdentityCardProps) {
  const imageUrl = getFlowerPrimaryImageUrl(flower);
  const eyebrow = (flower.flowerType?.trim() || flower.category).toUpperCase();
  const editHref = `/admin/flowers/${flower.publicIdentifier}`;
  const passportHref = `/flowers/${flower.publicIdentifier}`;

  return (
    <article className="group min-w-0 border border-border bg-background transition-colors hover:border-botanical/40">
      <Link href={editHref} className="block min-w-0">
        {imageUrl ? (
          <PassportImage
            src={imageUrl}
            alt={getFlowerImageAlt(flower)}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            wrapperClassName="relative aspect-[4/5] w-full border-b border-border/80"
            fallbackLabel="Image unavailable"
          />
        ) : (
          <div
            className="flex aspect-[4/5] w-full items-center justify-center border-b border-border/80 bg-muted/40 px-4 text-center"
            aria-hidden
          >
            <p className="type-meta uppercase tracking-wide">No image</p>
          </div>
        )}
        <div className="space-y-2 p-4 sm:p-5">
          <p className="type-editorial-label text-[0.6875rem] tracking-[0.14em]">
            {eyebrow}
          </p>
          <h3 className="font-display text-2xl font-semibold leading-snug text-foreground sm:text-[1.65rem]">
            {flower.name}
          </h3>
          <p className="font-mono text-xs text-muted-foreground">
            {flower.varietyCode} · {flower.publicIdentifier}
          </p>
          <p className="text-sm text-muted-foreground">{statusLine(flower)}</p>
          {showUpdated ? (
            <p className="type-meta pt-1">
              Updated {new Date(flower.updatedAt).toLocaleString()}
            </p>
          ) : null}
          <p className="pt-1 text-sm font-medium text-botanical opacity-90 transition-opacity group-hover:opacity-100">
            View Passport →
          </p>
        </div>
      </Link>
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border/80 px-4 pb-4 pt-2 text-sm sm:px-5">
        <Link
          href={passportHref}
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Preview
        </Link>
        <Link
          href={`${editHref}#qr`}
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          QR
        </Link>
      </div>
    </article>
  );
}

type FlowerIdentityRowProps = {
  flower: Flower;
};

export function FlowerIdentityRow({ flower }: FlowerIdentityRowProps) {
  const imageUrl = getFlowerPrimaryImageUrl(flower);
  const eyebrow = (flower.flowerType?.trim() || flower.category).toUpperCase();
  const editHref = `/admin/flowers/${flower.publicIdentifier}`;

  return (
    <li className="flex min-w-0 flex-col gap-4 border-b border-border py-5 last:border-0 sm:flex-row sm:items-center sm:gap-6">
      <Link
        href={editHref}
        className="relative block h-[8.75rem] w-[6.75rem] shrink-0 overflow-hidden border border-border/80 bg-muted/30"
      >
        {imageUrl ? (
          <PassportImage
            src={imageUrl}
            alt={getFlowerImageAlt(flower)}
            sizes="108px"
            wrapperClassName="absolute inset-0"
            fallbackLabel="—"
          />
        ) : (
          <span className="flex h-full items-center justify-center type-meta text-[0.625rem]">
            No image
          </span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="type-editorial-label text-[0.6875rem] tracking-[0.14em]">
          {eyebrow}
        </p>
        <Link
          href={editHref}
          className="mt-1 block font-display text-2xl font-semibold leading-snug text-foreground hover:text-botanical"
        >
          {flower.name}
        </Link>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {flower.varietyCode} · {flower.publicIdentifier}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{statusLine(flower)}</p>
      </div>
      <p className="shrink-0 type-meta sm:text-right">
        Updated {new Date(flower.updatedAt).toLocaleString()}
      </p>
    </li>
  );
}

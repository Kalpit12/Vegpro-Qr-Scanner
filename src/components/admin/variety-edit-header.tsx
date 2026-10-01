import type { Flower } from "@/domain/flower";
import { VarietyStatusBadges } from "@/components/admin/variety-status-badges";

type VarietyEditHeaderProps = {
  flower: Flower;
  actions?: React.ReactNode;
};

function formatVarietyMeta(flower: Flower) {
  const parts = [flower.publicIdentifier, flower.varietyCode];
  const typeOrCategory = flower.flowerType?.trim() || flower.category?.trim();
  if (typeOrCategory) {
    parts.push(typeOrCategory);
  }
  return parts.join(" · ");
}

export function VarietyEditHeader({ flower, actions }: VarietyEditHeaderProps) {
  return (
    <header className="border-b border-border pb-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="type-editorial-label">Variety</p>
          <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            {flower.name}
          </h1>
          <p className="type-meta font-mono text-sm text-foreground/85">
            {formatVarietyMeta(flower)}
          </p>
          <VarietyStatusBadges flower={flower} />
          <p className="type-meta">Source {flower.source.system}</p>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2 lg:pt-8">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

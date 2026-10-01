import type { Flower } from "@/domain/flower";

export function getFlowerPrimaryImage(flower: Flower) {
  const sorted = [...flower.images].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) {
      return left.isPrimary ? -1 : 1;
    }
    return left.displayOrder - right.displayOrder;
  });

  return sorted[0] ?? null;
}

export function getFlowerPrimaryImageUrl(flower: Flower): string | null {
  return getFlowerPrimaryImage(flower)?.url ?? null;
}

export function getFlowerImageAlt(flower: Flower): string {
  const primary = getFlowerPrimaryImage(flower);
  return primary?.altText ?? `${flower.name} photograph`;
}

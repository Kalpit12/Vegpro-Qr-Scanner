import type { Flower, PublicFlower } from "@/domain/flower";

export function toPublicFlower(flower: Flower): PublicFlower | null {
  if (!flower.publicVisible) {
    return null;
  }

  if (flower.status === "ARCHIVED" || flower.status === "DRAFT") {
    return null;
  }

  const publicImages = flower.images
    .filter((image) => image.publicVisible)
    .map(({ url, altText, displayOrder, isPrimary }) => ({
      url,
      altText,
      displayOrder,
      isPrimary,
    }));

  const publicParameters = flower.parameters
    .filter((parameter) => parameter.publicVisible)
    .map(({ name, key, category, dataType, unit, value, displayOrder }) => ({
      name,
      key,
      category,
      dataType,
      unit,
      value,
      displayOrder,
    }));

  const breedingApproved = flower.breeding?.publicVisible === true;
  const breeding =
    breedingApproved &&
    (flower.origin ||
      flower.breeder ||
      flower.breedingProgram ||
      flower.breedingYear ||
      flower.breeding?.publicSummary)
      ? {
          origin: flower.origin,
          breeder: flower.breeder,
          breedingProgram: flower.breedingProgram,
          breedingYear: flower.breedingYear,
          publicSummary: flower.breeding?.publicSummary ?? null,
        }
      : null;

  const varietyRelations = flower.varietyRelations
    .filter(
      (relation) =>
        relation.publicVisible &&
        relation.otherPubliclyVisible &&
        relation.relationType !== undefined,
    )
    .map((relation) => ({
      relationType: relation.relationType,
      publicIdentifier: relation.otherPublicIdentifier,
      name: relation.otherName,
      varietyCode: relation.otherVarietyCode,
      relatedVarietyIsParent:
        relation.relationType === "PARENT_OF" && !relation.thisFlowerIsParent,
    }));

  return {
    publicIdentifier: flower.publicIdentifier,
    varietyCode: flower.varietyCode,
    name: flower.name,
    category: flower.category,
    flowerType: flower.flowerType,
    shortDescription: flower.shortDescription,
    description: flower.description,
    status: flower.status,
    featured: flower.featured,
    images: publicImages,
    parameters: publicParameters,
    breeding,
    varietyRelations,
    source: {
      system: flower.source.system,
      lastUpdatedAt: flower.source.lastUpdatedAt,
    },
  };
}

export function publicFlowerIncludesInternalBreedingNotes(
  publicFlower: PublicFlower,
): boolean {
  const serialized = JSON.stringify(publicFlower);
  return (
    serialized.includes("breederNotesInternal") ||
    serialized.includes("trialNotesInternal") ||
    serialized.includes("Internal breeder note")
  );
}

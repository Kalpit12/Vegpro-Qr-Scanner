import type {
  breedingRecords,
  flowerImages,
  flowerParameterValues,
  flowerRecords,
  parameterDefinitions,
  varietyRelations,
} from "@/db/schema";
import type {
  BreedingInformation,
  Flower,
  FlowerImage,
  FlowerParameter,
  VarietyRelation,
} from "@/domain/flower";
import { mapDbRelationTypeToKind } from "@/lib/variety-relations";

type ParameterRow = {
  value: typeof flowerParameterValues.$inferSelect;
  definition: typeof parameterDefinitions.$inferSelect;
};

type RelatedFlowerRow = {
  record: typeof flowerRecords.$inferSelect;
  identity: { publicIdentifier: string };
};

export function mapVarietyRelationsForFlower(
  recordId: string,
  relations: (typeof varietyRelations.$inferSelect)[],
  relatedByRecordId: Map<string, RelatedFlowerRow>,
): VarietyRelation[] {
  const mapped: VarietyRelation[] = [];

  for (const relation of relations) {
    const kind = mapDbRelationTypeToKind(relation.relationType);
    if (!kind) {
      continue;
    }

    const isFrom = relation.fromFlowerRecordId === recordId;
    const otherRecordId = isFrom
      ? relation.toFlowerRecordId
      : relation.fromFlowerRecordId;
    const related = relatedByRecordId.get(otherRecordId);
    if (!related) {
      continue;
    }

    const thisFlowerIsParent =
      kind === "PARENT_OF" && relation.relationType === "PARENT"
        ? relation.fromFlowerRecordId === recordId
        : false;

    mapped.push({
      id: relation.id,
      relationType: kind,
      otherFlowerRecordId: otherRecordId,
      otherPublicIdentifier: related.identity.publicIdentifier,
      otherName: related.record.name,
      otherVarietyCode: related.record.varietyCode,
      otherPubliclyVisible:
        related.record.publicVisible &&
        related.record.status !== "ARCHIVED" &&
        related.record.status !== "DRAFT",
      publicVisible: relation.publicVisible,
      thisFlowerIsParent,
    });
  }

  return mapped;
}

export function mapRecordToFlower(input: {
  record: typeof flowerRecords.$inferSelect;
  publicIdentifier: string;
  categoryName: string;
  parameters: ParameterRow[];
  images: (typeof flowerImages.$inferSelect)[];
  breeding: typeof breedingRecords.$inferSelect | null;
  varietyRelations: VarietyRelation[];
}): Flower {
  const {
    record,
    publicIdentifier,
    categoryName,
    parameters,
    images,
    breeding,
    varietyRelations: mappedRelations,
  } = input;

  const mappedParameters: FlowerParameter[] = parameters.map((row) => ({
    id: row.value.id,
    definitionId: row.definition.id,
    name: row.definition.name,
    key: row.definition.key,
    category: row.definition.category,
    dataType: row.definition.dataType,
    unit: row.definition.unit,
    value: row.value.value,
    displayOrder: row.definition.displayOrder,
    publicVisible: row.value.publicVisible && row.definition.publicVisibility,
  }));

  const mappedImages: FlowerImage[] = images.map((image) => ({
    id: image.id,
    url: image.url,
    altText: image.altText,
    displayOrder: image.displayOrder,
    publicVisible: image.publicVisible,
    isPrimary: image.isPrimary,
  }));

  const mappedBreeding: BreedingInformation | null = breeding
    ? {
        breedingCode: breeding.breedingCode,
        publicSummary: breeding.publicSummary,
        publicVisible: breeding.publicVisible,
        breederNotesInternal: breeding.breederNotesInternal,
        trialNotesInternal: breeding.trialNotesInternal,
      }
    : null;

  return {
    id: record.id,
    externalId: record.externalId,
    publicIdentifier,
    varietyCode: record.varietyCode,
    name: record.name,
    slug: record.slug,
    categoryId: record.categoryId,
    category: categoryName,
    flowerType: record.flowerType,
    shortDescription: record.shortDescription,
    description: record.description,
    status: record.status,
    developmentStage: record.developmentStage,
    origin: record.origin,
    breeder: record.breeder,
    breedingProgram: record.breedingProgram,
    breedingYear: record.breedingYear,
    publicVisible: record.publicVisible,
    featured: record.featured,
    images: mappedImages,
    parameters: mappedParameters,
    breeding: mappedBreeding,
    varietyRelations: mappedRelations,
    source: {
      system: record.sourceSystem,
      externalId: record.sourceExternalId,
      lastUpdatedAt: record.sourceLastUpdatedAt.toISOString(),
      synchronizedAt: record.sourceSynchronizedAt
        ? record.sourceSynchronizedAt.toISOString()
        : null,
    },
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

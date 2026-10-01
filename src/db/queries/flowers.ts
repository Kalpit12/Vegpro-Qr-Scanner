import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  type SQL,
} from "drizzle-orm";
import type { FlowerQueryOptions } from "@/domain/flower";
import { getDb } from "@/db";
import { mapVarietyRelationsForFlower } from "@/db/mappers/flower-mapper";
import {
  breedingRecords,
  categories,
  flowerIdentities,
  flowerImages,
  flowerParameterValues,
  flowerRecords,
  parameterDefinitions,
  varietyRelations,
} from "@/db/schema";

function buildFlowerFilters(options?: FlowerQueryOptions): SQL | undefined {
  const filters: SQL[] = [];

  if (options?.publicOnly) {
    filters.push(eq(flowerRecords.publicVisible, true));
  }

  if (options?.search?.trim()) {
    const term = `%${options.search.trim()}%`;
    filters.push(
      or(
        ilike(flowerRecords.name, term),
        ilike(flowerRecords.varietyCode, term),
        ilike(flowerIdentities.publicIdentifier, term),
      )!,
    );
  }

  if (options?.status) {
    filters.push(eq(flowerRecords.status, options.status));
  }

  if (options?.categoryId) {
    filters.push(eq(flowerRecords.categoryId, options.categoryId));
  }

  if (options?.publicVisible !== undefined) {
    filters.push(eq(flowerRecords.publicVisible, options.publicVisible));
  }

  if (!options?.includeArchived) {
    filters.push(ne(flowerRecords.status, "ARCHIVED"));
  }

  return filters.length > 0 ? and(...filters) : undefined;
}

function buildFlowerOrder(options?: FlowerQueryOptions) {
  const sortBy = options?.sortBy ?? "updatedAt";
  const sortOrder = options?.sortOrder ?? "desc";
  const column =
    sortBy === "name"
      ? flowerRecords.name
      : sortBy === "varietyCode"
        ? flowerRecords.varietyCode
        : flowerRecords.updatedAt;

  return sortOrder === "asc" ? asc(column) : desc(column);
}

export async function queryFlowerRecordIds(options?: FlowerQueryOptions) {
  const db = getDb();
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  const where = buildFlowerFilters(options);

  return db
    .select({ id: flowerRecords.id })
    .from(flowerRecords)
    .innerJoin(
      flowerIdentities,
      eq(flowerRecords.flowerIdentityId, flowerIdentities.id),
    )
    .where(where)
    .orderBy(buildFlowerOrder(options))
    .limit(limit)
    .offset(offset);
}

export async function countFlowerRecords(
  options?: Omit<FlowerQueryOptions, "limit" | "offset">,
) {
  const db = getDb();
  const where = buildFlowerFilters(options);

  const [result] = await db
    .select({ total: count() })
    .from(flowerRecords)
    .innerJoin(
      flowerIdentities,
      eq(flowerRecords.flowerIdentityId, flowerIdentities.id),
    )
    .where(where);

  return Number(result?.total ?? 0);
}

export async function loadFlowerGraph(recordId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      record: flowerRecords,
      identity: flowerIdentities,
      category: categories,
    })
    .from(flowerRecords)
    .innerJoin(
      flowerIdentities,
      eq(flowerRecords.flowerIdentityId, flowerIdentities.id),
    )
    .innerJoin(categories, eq(flowerRecords.categoryId, categories.id))
    .where(eq(flowerRecords.id, recordId))
    .limit(1);

  if (!row) {
    return null;
  }

  const parameters = await db
    .select({
      value: flowerParameterValues,
      definition: parameterDefinitions,
    })
    .from(flowerParameterValues)
    .innerJoin(
      parameterDefinitions,
      eq(flowerParameterValues.parameterDefinitionId, parameterDefinitions.id),
    )
    .where(eq(flowerParameterValues.flowerRecordId, recordId))
    .orderBy(asc(parameterDefinitions.displayOrder));

  const images = await db
    .select()
    .from(flowerImages)
    .where(eq(flowerImages.flowerRecordId, recordId))
    .orderBy(asc(flowerImages.displayOrder));

  const [breeding] = await db
    .select()
    .from(breedingRecords)
    .where(eq(breedingRecords.flowerRecordId, recordId))
    .limit(1);

  const relationRows = await db
    .select()
    .from(varietyRelations)
    .where(
      or(
        eq(varietyRelations.fromFlowerRecordId, recordId),
        eq(varietyRelations.toFlowerRecordId, recordId),
      ),
    );

  const otherRecordIds = relationRows.map((relation) =>
    relation.fromFlowerRecordId === recordId
      ? relation.toFlowerRecordId
      : relation.fromFlowerRecordId,
  );

  const relatedRows =
    otherRecordIds.length > 0
      ? await db
          .select({
            record: flowerRecords,
            identity: flowerIdentities,
          })
          .from(flowerRecords)
          .innerJoin(
            flowerIdentities,
            eq(flowerRecords.flowerIdentityId, flowerIdentities.id),
          )
          .where(inArray(flowerRecords.id, otherRecordIds))
      : [];

  const relatedByRecordId = new Map(
    relatedRows.map((item) => [item.record.id, item]),
  );

  const mappedRelations = mapVarietyRelationsForFlower(
    recordId,
    relationRows,
    relatedByRecordId,
  );

  return {
    ...row,
    parameters,
    images,
    breeding: breeding ?? null,
    varietyRelations: mappedRelations,
  };
}

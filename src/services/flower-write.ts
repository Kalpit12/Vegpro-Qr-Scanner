import { and, eq, inArray, or } from "drizzle-orm";
import { getDb } from "@/db";
import {
  breedingRecords,
  flowerIdentities,
  flowerImages,
  flowerParameterValues,
  flowerRecords,
  parameterDefinitions,
  varietyRelations,
} from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { allocatePublicIdentifier } from "@/lib/public-identifier";
import { validateParameterValue } from "@/lib/validate-parameter-value";
import {
  resolveVarietyRelationEdges,
  type VarietyRelationInput,
} from "@/lib/variety-relations";
import type { CreateFlowerInput, UpdateFlowerInput } from "@/schemas/flower";

type Actor = { userId: string };

export async function createFlowerRecord(
  input: CreateFlowerInput,
  actor?: Actor,
) {
  const db = getDb();
  const now = new Date();

  await assertValidParameterValues(db, input.parameters);

  const result = await db.transaction(async (tx) => {
    const publicIdentifier = await allocatePublicIdentifier(tx);
    const [identity] = await tx
      .insert(flowerIdentities)
      .values({ publicIdentifier })
      .returning();

    const [record] = await tx
      .insert(flowerRecords)
      .values({
        flowerIdentityId: identity.id,
        externalId: input.externalId ?? publicIdentifier,
        varietyCode: input.varietyCode,
        name: input.name,
        slug: input.slug,
        categoryId: input.categoryId,
        flowerType: input.flowerType,
        shortDescription: input.shortDescription,
        description: input.description,
        status: input.status ?? "DRAFT",
        developmentStage: input.developmentStage,
        origin: input.origin,
        breeder: input.breeder,
        breedingProgram: input.breedingProgram,
        breedingYear: input.breedingYear,
        publicVisible: input.publicVisible ?? false,
        featured: input.featured ?? false,
        sourceSystem: "Demo",
        sourceExternalId: input.externalId ?? publicIdentifier,
        sourceLastUpdatedAt: now,
        sourceSynchronizedAt: now,
      })
      .returning();

    await syncParameters(tx, record.id, input.parameters);
    await syncImages(tx, record.id, input.images);
    await syncBreeding(tx, record.id, input.breeding);
    await syncVarietyRelations(tx, record.id, input.varietyRelations);

    return { recordId: record.id, publicIdentifier };
  });

  await recordAudit({
    userId: actor?.userId,
    action: "CREATE",
    entityType: "flower",
    entityId: result.publicIdentifier,
    newValue: { recordId: result.recordId, ...input },
  });

  return result;
}

export async function updateFlowerRecord(
  id: string,
  input: UpdateFlowerInput,
  actor?: Actor,
) {
  const db = getDb();
  const now = new Date();

  const [existing] = await db
    .select()
    .from(flowerRecords)
    .where(eq(flowerRecords.id, id))
    .limit(1);

  if (!existing) {
    return null;
  }

  if (input.parameters) {
    await assertValidParameterValues(db, input.parameters);
  }

  const [updated] = await db
    .update(flowerRecords)
    .set({
      varietyCode: input.varietyCode ?? existing.varietyCode,
      name: input.name ?? existing.name,
      slug: input.slug ?? existing.slug,
      categoryId: input.categoryId ?? existing.categoryId,
      flowerType: input.flowerType ?? existing.flowerType,
      shortDescription: input.shortDescription ?? existing.shortDescription,
      description: input.description ?? existing.description,
      status: input.status ?? existing.status,
      developmentStage: input.developmentStage ?? existing.developmentStage,
      origin: input.origin ?? existing.origin,
      breeder: input.breeder ?? existing.breeder,
      breedingProgram: input.breedingProgram ?? existing.breedingProgram,
      breedingYear: input.breedingYear ?? existing.breedingYear,
      publicVisible: input.publicVisible ?? existing.publicVisible,
      featured: input.featured ?? existing.featured,
      sourceLastUpdatedAt: now,
      updatedAt: now,
    })
    .where(eq(flowerRecords.id, id))
    .returning();

  if (input.parameters) {
    await db.transaction(async (tx) => {
      await syncParameters(tx, id, input.parameters);
    });
    await recordAudit({
      userId: actor?.userId,
      action: "UPDATE_PARAMETERS",
      entityType: "flower",
      entityId: id,
      newValue: input.parameters,
    });
  }

  if (input.images) {
    await db.transaction(async (tx) => {
      await syncImages(tx, id, input.images);
    });
    await recordAudit({
      userId: actor?.userId,
      action: "UPDATE_IMAGES",
      entityType: "flower",
      entityId: id,
      newValue: input.images,
    });
  }

  if (input.breeding) {
    await db.transaction(async (tx) => {
      await syncBreeding(tx, id, input.breeding);
    });
    await recordAudit({
      userId: actor?.userId,
      action: "UPDATE_BREEDING",
      entityType: "flower",
      entityId: id,
      newValue: {
        breedingCode: input.breeding.breedingCode,
        publicSummary: input.breeding.publicSummary,
        publicVisible: input.breeding.publicVisible,
      },
    });
  }

  if (input.varietyRelations) {
    await db.transaction(async (tx) => {
      await syncVarietyRelations(tx, id, input.varietyRelations);
    });
    await recordAudit({
      userId: actor?.userId,
      action: "UPDATE_RELATIONS",
      entityType: "flower",
      entityId: id,
      newValue: input.varietyRelations.map((relation) => ({
        relationType: relation.relationType,
        otherFlowerRecordId: relation.otherFlowerRecordId,
        publicVisible: relation.publicVisible,
        thisFlowerIsParent: relation.thisFlowerIsParent,
      })),
    });
  }

  await recordAudit({
    userId: actor?.userId,
    action: "UPDATE",
    entityType: "flower",
    entityId: id,
    previousValue: {
      name: existing.name,
      status: existing.status,
      publicVisible: existing.publicVisible,
    },
    newValue: {
      name: updated.name,
      status: updated.status,
      publicVisible: updated.publicVisible,
    },
  });

  return updated;
}

export async function archiveFlowerRecord(id: string, actor?: Actor) {
  const db = getDb();
  const now = new Date();

  const [existing] = await db
    .select()
    .from(flowerRecords)
    .where(eq(flowerRecords.id, id))
    .limit(1);

  if (!existing) {
    return null;
  }

  const [updated] = await db
    .update(flowerRecords)
    .set({
      status: "ARCHIVED",
      publicVisible: false,
      sourceLastUpdatedAt: now,
      updatedAt: now,
    })
    .where(eq(flowerRecords.id, id))
    .returning();

  await recordAudit({
    userId: actor?.userId,
    action: "ARCHIVE",
    entityType: "flower",
    entityId: id,
    previousValue: { status: existing.status },
    newValue: { status: "ARCHIVED" },
  });

  return updated;
}

type DbClient = Pick<
  ReturnType<typeof getDb>,
  "insert" | "update" | "delete" | "select" | "execute"
>;

async function syncParameters(
  tx: DbClient,
  recordId: string,
  parameters?: CreateFlowerInput["parameters"],
) {
  if (!parameters) {
    return;
  }

  await tx
    .delete(flowerParameterValues)
    .where(eq(flowerParameterValues.flowerRecordId, recordId));

  if (parameters.length === 0) {
    return;
  }

  await tx.insert(flowerParameterValues).values(
    parameters.map((parameter) => ({
      flowerRecordId: recordId,
      parameterDefinitionId: parameter.parameterDefinitionId,
      value: parameter.value,
      publicVisible: parameter.publicVisible ?? true,
    })),
  );
}

async function syncImages(
  tx: DbClient,
  recordId: string,
  images?: CreateFlowerInput["images"],
) {
  if (!images) {
    return;
  }

  await tx.delete(flowerImages).where(eq(flowerImages.flowerRecordId, recordId));

  if (images.length === 0) {
    return;
  }

  await tx.insert(flowerImages).values(
    images.map((image, index) => ({
      flowerRecordId: recordId,
      url: image.url,
      altText: image.altText,
      displayOrder: image.displayOrder ?? index,
      publicVisible: image.publicVisible ?? true,
      isPrimary: image.isPrimary ?? index === 0,
    })),
  );
}

async function syncBreeding(
  tx: DbClient,
  recordId: string,
  breeding?: CreateFlowerInput["breeding"],
) {
  if (!breeding) {
    return;
  }

  const [existing] = await tx
    .select()
    .from(breedingRecords)
    .where(eq(breedingRecords.flowerRecordId, recordId))
    .limit(1);

  if (existing) {
    await tx
      .update(breedingRecords)
      .set({
        breedingCode: breeding.breedingCode ?? existing.breedingCode,
        publicSummary: breeding.publicSummary ?? existing.publicSummary,
        publicVisible: breeding.publicVisible ?? existing.publicVisible,
        breederNotesInternal:
          breeding.breederNotesInternal ?? existing.breederNotesInternal,
        trialNotesInternal:
          breeding.trialNotesInternal ?? existing.trialNotesInternal,
        updatedAt: new Date(),
      })
      .where(eq(breedingRecords.flowerRecordId, recordId));
    return;
  }

  await tx.insert(breedingRecords).values({
    flowerRecordId: recordId,
    breedingCode: breeding.breedingCode,
    publicSummary: breeding.publicSummary,
    publicVisible: breeding.publicVisible ?? false,
    breederNotesInternal: breeding.breederNotesInternal,
    trialNotesInternal: breeding.trialNotesInternal,
  });
}

async function syncVarietyRelations(
  tx: DbClient,
  recordId: string,
  relations?: VarietyRelationInput[],
) {
  if (relations === undefined) {
    return;
  }

  const edges = resolveVarietyRelationEdges(recordId, relations);
  await assertFlowerRecordsExist(
    tx,
    edges.flatMap((edge) => [
      edge.fromFlowerRecordId,
      edge.toFlowerRecordId,
    ]),
  );

  await tx
    .delete(varietyRelations)
    .where(
      or(
        eq(varietyRelations.fromFlowerRecordId, recordId),
        and(
          eq(varietyRelations.toFlowerRecordId, recordId),
          eq(varietyRelations.relationType, "PARENT"),
        ),
        and(
          or(
            eq(varietyRelations.fromFlowerRecordId, recordId),
            eq(varietyRelations.toFlowerRecordId, recordId),
          ),
          eq(varietyRelations.relationType, "RELATED"),
        ),
      ),
    );

  if (edges.length === 0) {
    return;
  }

  await tx.insert(varietyRelations).values(
    edges.map((edge) => ({
      fromFlowerRecordId: edge.fromFlowerRecordId,
      toFlowerRecordId: edge.toFlowerRecordId,
      relationType: edge.dbRelationType,
      publicVisible: edge.publicVisible,
    })),
  );
}

async function assertFlowerRecordsExist(tx: DbClient, recordIds: string[]) {
  const uniqueIds = [...new Set(recordIds)];
  if (uniqueIds.length === 0) {
    return;
  }

  const rows = await tx
    .select({ id: flowerRecords.id })
    .from(flowerRecords)
    .where(inArray(flowerRecords.id, uniqueIds));

  if (rows.length !== uniqueIds.length) {
    throw new Error("INVALID_RELATION: Referenced variety does not exist");
  }
}

async function assertValidParameterValues(
  db: DbClient,
  parameters?: CreateFlowerInput["parameters"],
) {
  if (!parameters?.length) {
    return;
  }

  const definitionIds = parameters.map(
    (parameter) => parameter.parameterDefinitionId,
  );
  const definitions = await db
    .select()
    .from(parameterDefinitions)
    .where(inArray(parameterDefinitions.id, definitionIds));

  const definitionById = new Map(
    definitions.map((definition) => [definition.id, definition]),
  );

  for (const parameter of parameters) {
    const definition = definitionById.get(parameter.parameterDefinitionId);
    if (!definition) {
      throw new Error("INVALID_PARAMETER: Unknown parameter definition");
    }

    const result = validateParameterValue(definition, parameter.value);
    if (!result.valid) {
      throw new Error(`INVALID_PARAMETER: ${result.message}`);
    }
  }
}

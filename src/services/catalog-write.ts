import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, parameterDefinitions } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import type {
  CreateCategoryInput,
  CreateParameterDefinitionInput,
  UpdateCategoryInput,
  UpdateParameterDefinitionInput,
} from "@/schemas/catalog";

type Actor = { userId: string };

export async function listCategories(activeOnly = false) {
  const db = getDb();
  if (activeOnly) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.displayOrder));
  }
  return db.select().from(categories).orderBy(asc(categories.displayOrder));
}

export async function createCategory(input: CreateCategoryInput, actor: Actor) {
  const db = getDb();
  const [created] = await db
    .insert(categories)
    .values({
      name: input.name,
      slug: input.slug,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    })
    .returning();

  await recordAudit({
    userId: actor.userId,
    action: "CREATE",
    entityType: "category",
    entityId: created.id,
    newValue: input,
  });

  return created;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
  actor: Actor,
) {
  const db = getDb();
  const [updated] = await db
    .update(categories)
    .set({
      name: input.name,
      slug: input.slug,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    })
    .where(eq(categories.id, id))
    .returning();

  if (updated) {
    await recordAudit({
      userId: actor.userId,
      action: "UPDATE",
      entityType: "category",
      entityId: id,
      newValue: input,
    });
  }

  return updated ?? null;
}

export async function listParameterDefinitions(activeOnly = false) {
  const db = getDb();
  if (activeOnly) {
    return db
      .select()
      .from(parameterDefinitions)
      .where(eq(parameterDefinitions.isActive, true))
      .orderBy(asc(parameterDefinitions.displayOrder));
  }
  return db
    .select()
    .from(parameterDefinitions)
    .orderBy(asc(parameterDefinitions.displayOrder));
}

export async function createParameterDefinition(
  input: CreateParameterDefinitionInput,
  actor: Actor,
) {
  const db = getDb();
  const [created] = await db
    .insert(parameterDefinitions)
    .values({
      name: input.name,
      key: input.key,
      category: input.category,
      dataType: input.dataType,
      unit: input.unit,
      displayOrder: input.displayOrder ?? 0,
      publicVisibility: input.publicVisibility ?? true,
      isActive: input.isActive ?? true,
      validationConfig: input.validationConfig,
    })
    .returning();

  await recordAudit({
    userId: actor.userId,
    action: "CREATE",
    entityType: "parameter_definition",
    entityId: created.id,
    newValue: input,
  });

  return created;
}

export async function updateParameterDefinition(
  id: string,
  input: UpdateParameterDefinitionInput,
  actor: Actor,
) {
  const db = getDb();
  const [updated] = await db
    .update(parameterDefinitions)
    .set({
      name: input.name,
      key: input.key,
      category: input.category,
      dataType: input.dataType,
      unit: input.unit,
      displayOrder: input.displayOrder,
      publicVisibility: input.publicVisibility,
      isActive: input.isActive,
      validationConfig: input.validationConfig,
    })
    .where(eq(parameterDefinitions.id, id))
    .returning();

  if (updated) {
    await recordAudit({
      userId: actor.userId,
      action: "UPDATE",
      entityType: "parameter_definition",
      entityId: id,
      newValue: input,
    });
  }

  return updated ?? null;
}

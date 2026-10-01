import "@/env/load-local-env";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { getDb } from "./index";
import { syncPublicIdentifierSequence } from "@/lib/public-identifier";
import { DEMO_FLOWER_IMAGE_PATHS } from "@/lib/demo-flower-images";
import {
  breedingRecords,
  categories,
  flowerIdentities,
  flowerImages,
  flowerParameterValues,
  flowerRecords,
  parameterDefinitions,
  platformSettings,
  varietyRelations,
  users,
} from "./schema";

async function seed() {
  const db = getDb();
  const now = new Date();

  const adminPassword = await bcrypt.hash("DemoAdmin123!", 12);

  await db
    .insert(users)
    .values({
      email: "admin@demo.vegpro.local",
      name: "Demo Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    })
    .onConflictDoNothing();

  await db
    .insert(platformSettings)
    .values([
      {
        key: "data_source_label",
        value: "Demo Data Provider",
      },
      {
        key: "demo_mode",
        value: "true",
      },
    ])
    .onConflictDoNothing();

  const demoCategories = [
    { name: "Rose", slug: "rose", displayOrder: 1 },
    { name: "Carnation", slug: "carnation", displayOrder: 2 },
    { name: "Spray Rose", slug: "spray-rose", displayOrder: 3 },
    { name: "Chrysanthemum", slug: "chrysanthemum", displayOrder: 4 },
  ];

  for (const category of demoCategories) {
    await db.insert(categories).values(category).onConflictDoNothing();
  }

  const parameterDefs = [
    {
      name: "Stem Length",
      key: "stem_length",
      category: "Key Parameters",
      dataType: "number" as const,
      unit: "cm",
      displayOrder: 1,
    },
    {
      name: "Bud Size",
      key: "bud_size",
      category: "Key Parameters",
      dataType: "decimal" as const,
      unit: "cm",
      displayOrder: 2,
    },
    {
      name: "Vase Life",
      key: "vase_life",
      category: "Key Parameters",
      dataType: "number" as const,
      unit: "days",
      displayOrder: 3,
    },
    {
      name: "Grade",
      key: "grade",
      category: "Key Parameters",
      dataType: "select" as const,
      unit: null,
      displayOrder: 4,
      validationConfig: JSON.stringify({ options: ["A", "B", "C"] }),
    },
    {
      name: "Colour",
      key: "colour",
      category: "Characteristics",
      dataType: "text" as const,
      unit: null,
      displayOrder: 5,
    },
  ];

  for (const definition of parameterDefs) {
    await db.insert(parameterDefinitions).values(definition).onConflictDoNothing();
  }

  const definitions = await db.select().from(parameterDefinitions);
  const definitionByKey = Object.fromEntries(
    definitions.map((definition) => [definition.key, definition]),
  );

  const demoFlowers = [
    {
      publicIdentifier: "VP-0001",
      varietyCode: "EXP-01",
      name: "Explorer",
      category: "Rose",
      flowerType: "Rose",
      shortDescription: "Fictional demo rose variety for platform testing.",
      description:
        "Explorer is sample demo data only. It is not an official VegPro commercial variety.",
      status: "APPROVED" as const,
      developmentStage: "COMMERCIAL" as const,
      publicVisible: true,
      featured: true,
      parameters: [
        { key: "stem_length", value: "72" },
        { key: "bud_size", value: "5.8" },
        { key: "vase_life", value: "14" },
        { key: "grade", value: "A" },
        { key: "colour", value: "Deep Red" },
      ],
      imageUrl: DEMO_FLOWER_IMAGE_PATHS["VP-0001"],
    },
    {
      publicIdentifier: "VP-0002",
      varietyCode: "RV-02",
      name: "Red Velvet",
      category: "Rose",
      flowerType: "Rose",
      shortDescription: "Fictional demo rose used for passport testing.",
      description:
        "Red Velvet is fictional demo content and must not be presented as real VegPro breeding data.",
      status: "TRIAL" as const,
      developmentStage: "TRIAL" as const,
      publicVisible: true,
      featured: false,
      parameters: [
        { key: "stem_length", value: "68" },
        { key: "bud_size", value: "5.2" },
        { key: "vase_life", value: "12" },
        { key: "grade", value: "B" },
        { key: "colour", value: "Velvet Red" },
      ],
      imageUrl: DEMO_FLOWER_IMAGE_PATHS["VP-0002"],
    },
    {
      publicIdentifier: "VP-0003",
      varietyCode: "SA-03",
      name: "Sweet Aurora",
      category: "Spray Rose",
      flowerType: "Spray Rose",
      shortDescription: "Fictional spray rose demo record.",
      description:
        "Sweet Aurora exists only to validate the demo data provider and public visibility rules.",
      status: "EVALUATION" as const,
      developmentStage: "EVALUATION" as const,
      publicVisible: true,
      featured: true,
      parameters: [
        { key: "stem_length", value: "55" },
        { key: "bud_size", value: "3.4" },
        { key: "vase_life", value: "10" },
        { key: "grade", value: "A" },
        { key: "colour", value: "Blush Pink" },
      ],
      imageUrl: DEMO_FLOWER_IMAGE_PATHS["VP-0003"],
    },
  ];

  const categoryRows = await db.select().from(categories);
  const categoryIdByName = Object.fromEntries(
    categoryRows.map((row) => [row.name, row.id]),
  );

  for (const demo of demoFlowers) {
    const [existingIdentity] = await db
      .select()
      .from(flowerIdentities)
      .where(eq(flowerIdentities.publicIdentifier, demo.publicIdentifier))
      .limit(1);

    if (existingIdentity) {
      continue;
    }

    const [identity] = await db
      .insert(flowerIdentities)
      .values({ publicIdentifier: demo.publicIdentifier })
      .returning();

    const [record] = await db
      .insert(flowerRecords)
      .values({
        flowerIdentityId: identity.id,
        externalId: demo.publicIdentifier,
        varietyCode: demo.varietyCode,
        name: demo.name,
        categoryId: categoryIdByName[demo.category],
        flowerType: demo.flowerType,
        shortDescription: demo.shortDescription,
        description: demo.description,
        status: demo.status,
        developmentStage: demo.developmentStage,
        publicVisible: demo.publicVisible,
        featured: demo.featured,
        sourceSystem: "Demo",
        sourceExternalId: demo.publicIdentifier,
        sourceLastUpdatedAt: now,
        sourceSynchronizedAt: now,
      })
      .returning();

    await db.insert(flowerImages).values({
      flowerRecordId: record.id,
      url: demo.imageUrl,
      altText: `${demo.name} demo image`,
      displayOrder: 0,
      publicVisible: true,
      isPrimary: true,
    });

    await db.insert(flowerParameterValues).values(
      demo.parameters.map((parameter) => ({
        flowerRecordId: record.id,
        parameterDefinitionId: definitionByKey[parameter.key].id,
        value: parameter.value,
        publicVisible: true,
      })),
    );

    await db.insert(breedingRecords).values({
      flowerRecordId: record.id,
      breedingCode: `${demo.varietyCode}-DEMO`,
      publicSummary:
        "Approved public demo summary only. Internal breeding notes remain private in later phases.",
      publicVisible: true,
      breederNotesInternal: "Private demo breeding note — must never appear on public APIs.",
    });
  }

  await syncPublicIdentifierSequence(db);
  await syncDemoFlowerImageUrls(db);
  await syncDemoBreedingFoundation(db);

  console.log("Seed completed.");
}

async function syncDemoBreedingFoundation(db: ReturnType<typeof getDb>) {
  const explorer = await findRecordByPublicId(db, "VP-0001");
  const redVelvet = await findRecordByPublicId(db, "VP-0002");

  if (explorer) {
    await db
      .update(flowerRecords)
      .set({
        origin: "Netherlands",
        breeder: "VegPro Breeding",
        breedingProgram: "Spray rose program",
        breedingYear: 2022,
      })
      .where(eq(flowerRecords.id, explorer.id));

    await db
      .update(breedingRecords)
      .set({
        publicSummary:
          "Developed through VegPro's spray rose breeding program.",
        publicVisible: true,
        breederNotesInternal:
          "Internal breeder note — confidential.",
      })
      .where(eq(breedingRecords.flowerRecordId, explorer.id));
  }

  if (explorer && redVelvet) {
    const [existingRelation] = await db
      .select({ id: varietyRelations.id })
      .from(varietyRelations)
      .where(
        and(
          eq(varietyRelations.fromFlowerRecordId, explorer.id),
          eq(varietyRelations.toFlowerRecordId, redVelvet.id),
          eq(varietyRelations.relationType, "PARENT"),
        ),
      )
      .limit(1);

    if (!existingRelation) {
      await db.insert(varietyRelations).values({
        fromFlowerRecordId: explorer.id,
        toFlowerRecordId: redVelvet.id,
        relationType: "PARENT",
        publicVisible: true,
      });
    }
  }
}

async function findRecordByPublicId(
  db: ReturnType<typeof getDb>,
  publicIdentifier: string,
) {
  const [identity] = await db
    .select()
    .from(flowerIdentities)
    .where(eq(flowerIdentities.publicIdentifier, publicIdentifier))
    .limit(1);

  if (!identity) {
    return null;
  }

  const [record] = await db
    .select()
    .from(flowerRecords)
    .where(eq(flowerRecords.flowerIdentityId, identity.id))
    .limit(1);

  return record ?? null;
}

async function syncDemoFlowerImageUrls(
  db: ReturnType<typeof getDb>,
) {
  for (const [publicIdentifier, url] of Object.entries(
    DEMO_FLOWER_IMAGE_PATHS,
  )) {
    const [identity] = await db
      .select()
      .from(flowerIdentities)
      .where(eq(flowerIdentities.publicIdentifier, publicIdentifier))
      .limit(1);

    if (!identity) {
      continue;
    }

    const [record] = await db
      .select()
      .from(flowerRecords)
      .where(eq(flowerRecords.flowerIdentityId, identity.id))
      .limit(1);

    if (!record) {
      continue;
    }

    await db
      .update(flowerImages)
      .set({
        url,
        altText: `${record.name} photograph`,
      })
      .where(eq(flowerImages.flowerRecordId, record.id));
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

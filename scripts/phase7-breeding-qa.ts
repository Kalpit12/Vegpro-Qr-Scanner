import type { Flower } from "@/domain/flower";
import { resolveVarietyRelationEdges } from "@/lib/variety-relations";
import { toPublicFlower } from "@/services/public-flower";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildStaffFlower(overrides: Partial<Flower> = {}): Flower {
  const base: Flower = {
    id: "11111111-1111-1111-1111-111111111111",
    externalId: "VP-TEST",
    publicIdentifier: "VP-TEST",
    varietyCode: "TST-01",
    name: "Test Variety",
    slug: null,
    categoryId: "22222222-2222-2222-2222-222222222222",
    category: "Rose",
    flowerType: "Rose",
    shortDescription: null,
    description: null,
    status: "APPROVED",
    developmentStage: null,
    origin: "Netherlands",
    breeder: "VegPro Breeding",
    breedingProgram: "Spray rose program",
    breedingYear: 2024,
    publicVisible: true,
    featured: false,
    images: [],
    parameters: [],
    breeding: {
      breedingCode: "TST-01",
      publicSummary:
        "Developed through VegPro's spray rose breeding program.",
      publicVisible: true,
      breederNotesInternal: "Internal breeder note — confidential.",
      trialNotesInternal: "Trial note — confidential.",
    },
    varietyRelations: [],
    source: {
      system: "Demo",
      externalId: "VP-TEST",
      lastUpdatedAt: new Date().toISOString(),
      synchronizedAt: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { ...base, ...overrides };
}

function testPublicDtoPrivacy() {
  const publicFlower = toPublicFlower(buildStaffFlower());
  assert(publicFlower !== null, "Expected public flower");

  const serialized = JSON.stringify(publicFlower);
  assert(
    !serialized.includes("Internal breeder note"),
    "Internal breeder note leaked into PublicFlower JSON",
  );
  assert(
    !serialized.includes("Trial note — confidential"),
    "Internal trial note leaked into PublicFlower JSON",
  );
  assert(
    !serialized.includes("breederNotesInternal"),
    "Internal field name leaked into PublicFlower JSON",
  );
  assert(
    Boolean(
      publicFlower!.breeding?.publicSummary?.includes("VegPro's spray rose"),
    ),
    "Expected public breeding summary on passport DTO",
  );
  assert(
    publicFlower!.breeding?.breeder === "VegPro Breeding",
    "Expected public breeder on passport DTO when breeding is approved",
  );
}

function testPublicDtoHidesUnapprovedBreeding() {
  const publicFlower = toPublicFlower(
    buildStaffFlower({
      breeding: {
        breedingCode: "X",
        publicSummary: "Hidden summary",
        publicVisible: false,
        breederNotesInternal: "secret",
      },
    }),
  );
  assert(publicFlower !== null, "Flower still public");
  assert(publicFlower!.breeding === null, "Unapproved breeding must be omitted");
  assert(
    publicFlower!.varietyRelations.length === 0,
    "Expected no relations",
  );
}

function testRelationValidation() {
  const recordId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const otherId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

  try {
    resolveVarietyRelationEdges(recordId, [
      { relationType: "PARENT_OF", otherFlowerRecordId: recordId },
    ]);
    throw new Error("Expected self-reference rejection");
  } catch (error) {
    assert(
      error instanceof Error && error.message.includes("cannot relate to itself"),
      "Expected self-reference error",
    );
  }

  try {
    resolveVarietyRelationEdges(recordId, [
      { relationType: "RELATED_TO", otherFlowerRecordId: otherId },
      { relationType: "RELATED_TO", otherFlowerRecordId: otherId },
    ]);
    throw new Error("Expected duplicate rejection");
  } catch (error) {
    assert(
      error instanceof Error && error.message.includes("Duplicate"),
      "Expected duplicate relationship error",
    );
  }

  const edges = resolveVarietyRelationEdges(recordId, [
    { relationType: "PARENT_OF", otherFlowerRecordId: otherId },
    { relationType: "RELATED_TO", otherFlowerRecordId: otherId, publicVisible: true },
  ]);
  assert(edges.length === 2, "Expected two distinct edges");
}

async function main() {
  testPublicDtoPrivacy();
  testPublicDtoHidesUnapprovedBreeding();
  testRelationValidation();
  console.log("Phase 7 breeding QA: all checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

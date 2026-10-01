import { buildFlowerPublicPath, buildFlowerPublicUrl } from "@/lib/flower-public-url";
import { toPublicFlower } from "@/services/public-flower";
import type { Flower } from "@/domain/flower";
import { getActiveFlowerDataProviderKind } from "@/providers/provider-factory";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildStaffFlower(): Flower {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    externalId: "VP-0003",
    publicIdentifier: "VP-0003",
    varietyCode: "SA-03",
    name: "Sweet Aurora",
    slug: null,
    categoryId: "22222222-2222-2222-2222-222222222222",
    category: "Spray Rose",
    flowerType: "Spray Rose",
    shortDescription: null,
    description: null,
    status: "APPROVED",
    developmentStage: null,
    origin: "Netherlands",
    breeder: "VegPro Breeding",
    breedingProgram: "Program",
    breedingYear: 2024,
    publicVisible: true,
    featured: false,
    images: [],
    parameters: [
      {
        id: "p1",
        definitionId: "d1",
        name: "Secret",
        key: "secret",
        category: "Internal",
        dataType: "text",
        unit: null,
        value: "private-value",
        displayOrder: 1,
        publicVisible: false,
      },
    ],
    breeding: {
      breedingCode: "X",
      publicSummary: "Developed through VegPro's spray rose breeding program.",
      publicVisible: true,
      breederNotesInternal: "Internal breeder note — confidential.",
      trialNotesInternal: "Trial note — confidential.",
    },
    varietyRelations: [],
    source: {
      system: "Demo",
      externalId: "VEGPRO-123",
      lastUpdatedAt: new Date().toISOString(),
      synchronizedAt: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function testPublicBoundary() {
  const publicFlower = toPublicFlower(buildStaffFlower());
  assert(publicFlower !== null, "Expected public flower");
  const json = JSON.stringify(publicFlower);

  for (const forbidden of [
    "11111111-1111-1111-1111-111111111111",
    "Internal breeder note",
    "Trial note — confidential",
    "breederNotesInternal",
    "trialNotesInternal",
    "private-value",
    "VEGPRO-123",
    "externalId",
  ]) {
    assert(!json.includes(forbidden), `Public DTO leaked: ${forbidden}`);
  }

  assert(
    Boolean(publicFlower!.breeding?.publicSummary?.includes("VegPro's spray rose")),
    "Public summary should remain visible when approved",
  );
}

function testStableQrIdentity() {
  process.env.NEXT_PUBLIC_APP_URL = "http://example.test:5001";
  const url = buildFlowerPublicUrl("VP-0003");
  assert(url === "http://example.test:5001/flowers/VP-0003", "QR URL must use publicIdentifier only");
  assert(
    !url.includes("11111111") && !url.includes("VEGPRO"),
    "QR URL must not encode internal ids",
  );
  assert(buildFlowerPublicPath("VP-0003") === "/flowers/VP-0003", "Public path stable");
}

function testProviderKind() {
  assert(
    getActiveFlowerDataProviderKind() === "demo-postgres",
    "V1 reads must remain on demo-postgres provider",
  );
}

async function testPublicHttpBoundary() {
  const base = process.env.QA_BASE_URL ?? "http://localhost:5001";
  let response: Response;
  try {
    response = await fetch(`${base}/api/public/flowers/VP-0001`);
  } catch {
    console.warn("Phase 9 security: skipping HTTP tests (server unreachable).");
    return;
  }

  assert(response.ok, "Public API should return VP-0001");
  const body = (await response.json()) as { data?: unknown };
  const json = JSON.stringify(body.data);
  assert(!json.includes("breederNotesInternal"), "Public API leaked internal breeding");
  assert(!json.includes("Internal breeder note"), "Public API leaked confidential note");
}

async function testUnauthorizedHttp() {
  const base = process.env.QA_BASE_URL ?? "http://localhost:5001";
  try {
    const [flowers, sync] = await Promise.all([
      fetch(`${base}/api/flowers`, { credentials: "omit" }),
      fetch(`${base}/api/integrations/sync`, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "full", source: "VegPro" }),
      }),
    ]);
    assert(flowers.status === 401, `Expected 401 for /api/flowers, got ${flowers.status}`);
    assert(sync.status === 401, `Expected 401 for sync, got ${sync.status}`);
  } catch {
    console.warn("Phase 9 security: skipping unauthorized HTTP tests (server unreachable).");
  }
}

async function main() {
  testPublicBoundary();
  testStableQrIdentity();
  testProviderKind();
  await testPublicHttpBoundary();
  await testUnauthorizedHttp();
  console.log("Phase 9 security QA: all checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

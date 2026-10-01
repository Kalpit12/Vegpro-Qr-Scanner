import { IntegrationNotConfiguredError } from "@/integration/errors";
import { getSourceAdapter } from "@/integration/registry";
import {
  assertExternalIdIsNotPublicIdentifier,
  validateSourceExternalId,
} from "@/integration/validate-external-id";
import { mapVegProPayloadToDomainDraft } from "@/integration/vegpro-mapper";
import {
  getActiveFlowerDataProviderKind,
} from "@/providers/provider-factory";
import { VegProApiDataProvider } from "@/providers/vegpro-api-data-provider";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function testProviderBoundary() {
  assert(
    getActiveFlowerDataProviderKind() === "demo-postgres",
    "Active provider must remain demo-postgres until VegPro is configured",
  );

  const vegProProvider = new VegProApiDataProvider();
  try {
    await vegProProvider.getFlower("x");
    throw new Error("Expected IntegrationNotConfiguredError");
  } catch (error) {
    assert(
      error instanceof IntegrationNotConfiguredError,
      "VegProApiDataProvider must fail clearly",
    );
  }
}

function testExternalIdValidation() {
  assert(validateSourceExternalId("VEGPRO-123").valid, "Valid external id");
  assert(!validateSourceExternalId("").valid, "Empty external id invalid");
  assert(!validateSourceExternalId("bad id").valid, "Spaces invalid");

  let blocked = false;
  try {
    assertExternalIdIsNotPublicIdentifier("VP-0003", "VP-0003");
  } catch {
    blocked = true;
  }
  assert(blocked, "External id must not equal publicIdentifier");
}

function testVegProMapperPreservesPublicId() {
  const draft = mapVegProPayloadToDomainDraft(
    {
      externalId: "VEGPRO-123",
      lastUpdatedAt: "2026-01-01T00:00:00.000Z",
    },
    "VP-0003",
  );
  assert(draft.preservePublicIdentifier === "VP-0003", "VP-0003 must be preserved");
  assert(draft.sourceExternalId === "VEGPRO-123", "External id mapped");
}

async function testVegProAdapterNotConfigured() {
  const adapter = getSourceAdapter("VegPro");
  assert(!adapter.isConfigured(), "VegPro adapter not configured");
  try {
    await adapter.pullSync("full");
    throw new Error("Expected not configured error");
  } catch (error) {
    assert(
      error instanceof IntegrationNotConfiguredError,
      "VegPro sync must fail clearly",
    );
  }
}

async function testDemoAdapter() {
  const adapter = getSourceAdapter("Demo");
  const result = await adapter.pullSync("full");
  assert(result.recordsChanged === 0, "Demo sync must not mutate counts");
}

async function main() {
  await testProviderBoundary();
  testExternalIdValidation();
  testVegProMapperPreservesPublicId();
  await testVegProAdapterNotConfigured();
  await testDemoAdapter();
  console.log("Phase 8 integration QA: all checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

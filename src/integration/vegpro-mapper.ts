import type { SourceSystem } from "@/domain/flower";
import {
  assertExternalIdIsNotPublicIdentifier,
  validateSourceExternalId,
} from "./validate-external-id";
import type { VegProFlowerPayload } from "./types";

export type MappedSourceFlowerDraft = {
  sourceSystem: Extract<SourceSystem, "VegPro">;
  sourceExternalId: string;
  sourceLastUpdatedAt: string;
  /** Existing platform identity — never replaced by sync. */
  preservePublicIdentifier: string;
};

/**
 * Future VegPro → domain mapping boundary.
 * Phase 8: validates identifiers only; does not invent field mappings.
 */
export function mapVegProPayloadToDomainDraft(
  payload: VegProFlowerPayload,
  existingPublicIdentifier: string,
): MappedSourceFlowerDraft {
  const externalValidation = validateSourceExternalId(payload.externalId);
  if (!externalValidation.valid) {
    throw new Error(`INVALID_VEGPRO_PAYLOAD: ${externalValidation.message}`);
  }

  assertExternalIdIsNotPublicIdentifier(
    payload.externalId,
    existingPublicIdentifier,
  );

  if (!payload.lastUpdatedAt || typeof payload.lastUpdatedAt !== "string") {
    throw new Error(
      "INVALID_VEGPRO_PAYLOAD: lastUpdatedAt is required for synchronized records",
    );
  }

  return {
    sourceSystem: "VegPro",
    sourceExternalId: payload.externalId.trim(),
    sourceLastUpdatedAt: payload.lastUpdatedAt,
    preservePublicIdentifier: existingPublicIdentifier,
  };
}

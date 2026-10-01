/**
 * Initial field ownership model for synchronized flower data.
 * Document-only enforcement in Phase 8 — full enforcement waits for the VegPro contract.
 */

/** Platform-owned: must not be overwritten by source sync or external IDs. */
export const PLATFORM_OWNED_CONCEPTS = [
  "publicIdentifier (VP-####)",
  "flowerIdentityId",
  "public passport URL / QR payload",
  "platform analytics events",
  "audit log records",
  "platform presentation toggles where explicitly platform-scoped",
] as const;

/** Source-owned when sourceSystem is VegPro and sync is active (future). */
export const SOURCE_OWNED_CONCEPTS = [
  "varietyCode",
  "name",
  "category (mapped)",
  "flowerType",
  "descriptions",
  "status / developmentStage (when defined by source contract)",
  "origin / breeder / breeding program metadata from source",
  "parameter values synchronized from source",
  "sourceExternalId",
  "sourceLastUpdatedAt",
  "sourceSynchronizedAt",
] as const;

/** Requires VegPro contract before ownership is finalized. */
export const OWNERSHIP_TBD_CONCEPTS = [
  "publicVisible / featured (workflow may remain platform-side)",
  "breeding internal notes",
  "variety relationship edges created in admin",
  "image URLs when source media contract is unknown",
] as const;

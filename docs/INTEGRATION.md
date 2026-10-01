# VegPro integration readiness (Phase 8)

**VegPro integration is not configured yet.**

This application is the integration, presentation, public Flower Passport, QR identity, and analytics layer. When VegPro’s real source system is available, synchronized flower **content** will flow through an adapter into the existing `FlowerDataProvider` boundary. Platform-owned **`VP-####`** identifiers and QR URLs remain stable.

## Current source: Demo

- Flower records use `source.system = Demo` in the domain model (`flower_records.source_system`).
- Reads go through **`MockFlowerDataProvider`** (PostgreSQL-backed demo data).
- Seed data is fictional and labeled in platform settings (`demo_mode`, `data_source_label`).

## Future source: VegPro

- Domain enum already includes `VegPro` as a `SourceSystem`.
- **`VegProApiDataProvider`** exists as a **placeholder** and throws `IntegrationNotConfiguredError` if ever selected without configuration.
- **`VegProSourceAdapter`** refuses sync until a real contract exists.

## Architecture

```text
VegPro source of truth (future)
        ↓
SourceAdapter (Demo | VegPro)
        ↓
SyncService → sync_events
        ↓
FlowerDataProvider (integration boundary)
        ↓
Flower domain
        ↓
PublicFlower → Passport / QR / Analytics
```

### FlowerDataProvider boundary

Public UI, Passport, QR, and analytics **must not** import Drizzle or call VegPro directly. They use `getFlowerDataProvider()` from `src/providers/provider-factory.ts`.

Active runtime provider: **`demo-postgres`** until VegPro is explicitly enabled.

### Source metadata (per flower)

| Field | Role |
|--------|------|
| `sourceSystem` | `Demo` or `VegPro` |
| `sourceExternalId` | Id in the external system (never replaces `VP-####`) |
| `sourceLastUpdatedAt` | Last change time at source |
| `sourceSynchronizedAt` | Last successful platform sync |

**Rule:** `publicIdentifier` (`VP-0003`) is platform-owned and permanent. If VegPro’s external id changes, the same flower identity and QR URL stay tied to `VP-0003`.

### Sync boundary

- **`runSynchronization()`** in `src/services/sync-service.ts`
- Adapters: `DemoSourceAdapter`, `VegProSourceAdapter` (`src/integration/adapters/`)
- Each run creates a row in **`sync_events`** (`PENDING` → `SUCCESS` | `ERROR`)
- Admin-only API: `POST /api/integrations/sync` (ADMIN role)

Demo sync: reports that data is local (0 records changed).  
VegPro sync: records **ERROR** with a clear “not configured” message — **no fake remote data**.

### Future webhook boundary

**Not implemented** — VegPro’s webhook contract is unknown.

Planned route (future): `POST /api/integrations/vegpro/webhook`

Required before implementation:

- Authentication / signature verification scheme
- Event types and payload schema
- Idempotency and replay rules
- Mapping from payload → `VegProFlowerPayload` → domain (via `mapVegProPayloadToDomainDraft`)
- Explicit ownership rules per field

Until then, **do not** accept unauthenticated webhook traffic or mutate flowers from arbitrary JSON.

See `docs/WEBHOOK_BOUNDARY.md`.

### Mapping layer

- `src/integration/vegpro-mapper.ts` — external id validation + **`preservePublicIdentifier`**
- VegPro-specific field names must not leak into React, Passport, or `PublicFlower`

### Source-of-truth rule

- **VegPro** (when connected) is authoritative for **synchronized** flower fields defined in the integration contract.
- **Platform** owns identity, QR, analytics, audit, and public identifier allocation.
- Ambiguous fields are listed in `src/integration/ownership.ts` as TBD until VegPro specifies workflow.

### Admin integration status

- **`/admin/integration`** (ADMIN only): connection status, record counts by source, manual sync actions, last VegPro sync attempt from `sync_events`.

## Failure behavior

Sync failures **do not** delete demo data or break Passport/QR/analytics. Failed VegPro syncs append **`sync_events`** errors only.

## Information required from VegPro before a real connector

1. **Transport:** REST, GraphQL, database export, file feed, or other — with endpoints and environments.
2. **Authentication:** API keys, OAuth, mTLS, IP allowlists — and rotation process.
3. **Entity model:** How varieties are identified; stable external keys; delete/archive semantics.
4. **Field catalog:** Names, types, and meanings for all synchronized attributes (including breeding and media).
5. **Category / parameter mapping:** How VegPro categories map to platform `categories` and `parameter_definitions`.
6. **Ownership:** Which fields VegPro owns vs platform workflow (visibility, passport approval, internal notes).
7. **Sync model:** Full vs incremental cursor; webhooks vs polling; rate limits; batch sizes.
8. **Webhook contract** (if any): signatures, event types, payload schemas, retry policy.
9. **Conflict policy:** What happens when admin edits overlap source updates (initially: document, do not auto-merge).
10. **Non-production credentials** for a sandbox environment.

Until these are defined, **`VegPro integration is not configured yet`**.

# Future VegPro webhook boundary

**Status:** Not implemented. **VegPro integration is not configured yet.**

## Intended route (future)

`POST /api/integrations/vegpro/webhook`

## Requirements before coding the handler

1. **Verified identity** — shared secret, HMAC signature, or mTLS; reject unsigned requests with `401`.
2. **Published schema** — VegPro-owned OpenAPI/JSON Schema for each event type; no guessed fields.
3. **Idempotency** — event id or deduplication key stored to prevent double application.
4. **Least privilege** — handler runs server-side only; no secrets in client bundles or logs.
5. **Mapping isolation** — parse → validate → `mapVegProPayloadToDomainDraft` → persistence; never pass raw VegPro keys to UI.
6. **Stable identity** — match on `sourceExternalId` + existing `flower_identity`; never assign a new `VP-####` on webhook update unless product rules explicitly require a new variety.
7. **Failure isolation** — invalid payloads return `4xx` without corrupting existing rows; record outcome in `sync_events` or a dedicated audit channel.

## Explicit non-goals for the placeholder phase

- No fake VegPro webhook URL that accepts public POST bodies
- No mutation of demo/production flower rows from unauthenticated input
- No invented event names or payload shapes

When VegPro supplies the contract, implement the route behind the above checks and document the schema in this file.

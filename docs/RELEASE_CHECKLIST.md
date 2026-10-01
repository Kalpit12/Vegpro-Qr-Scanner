# V1 release checklist

Use this before promoting a production deployment of the VegPro Digital Flower Passport.

**VegPro integration is not configured yet.** Production runs on Demo PostgreSQL data until a real VegPro connector is implemented (see [INTEGRATION.md](./INTEGRATION.md)).

## Environment

- [ ] `DATABASE_URL` points to production PostgreSQL (pooler URL if using Supabase)
- [ ] `AUTH_SECRET` is a strong random value (not committed)
- [ ] `AUTH_URL` matches the public origin (e.g. `https://passport.example.com`)
- [ ] `NEXT_PUBLIC_APP_URL` matches the public origin used in QR codes
- [ ] No secrets in git; `.env.local` only on servers/CI secrets
- [ ] Shell env does not override `.env.local` for `NEXT_PUBLIC_APP_URL` (see README)

## Database

- [ ] `npm run db:migrate` applied on production database
- [ ] Do **not** run seed on production unless intentionally loading demo data
- [ ] Backup taken before migration
- [ ] Rollback plan: restore backup + redeploy previous app version

## Build & QA

- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] `npm run qa:phase6` (analytics)
- [ ] `npm run qa:phase7` (breeding privacy)
- [ ] `npm run qa:phase8` (integration boundary)
- [ ] `npm run qa:phase9` (V1 hardening acceptance; use `CI=true` or stop any process on port **5001** so Playwright starts a fresh `next start` after build)
- [ ] Manual: scan a printed QR on a phone using production `NEXT_PUBLIC_APP_URL`

## Authentication

- [ ] Admin accounts created with strong passwords
- [ ] `/admin/*` requires login (middleware)
- [ ] VIEWER cannot access ADMIN-only pages (audit, integration, catalog config)
- [ ] Public users cannot call staff mutation APIs

## Public surface

- [ ] `/flowers/VP-####` serves only `PublicFlower` data
- [ ] Internal breeding notes never appear in public API or HTML
- [ ] Draft/archived/non-visible varieties return not-available states

## Stable identity

- [ ] `VP-####` identifiers unchanged after edits
- [ ] QR encodes `{NEXT_PUBLIC_APP_URL}/flowers/{publicIdentifier}` only

## Integration

- [ ] `/admin/integration` shows **not connected**
- [ ] VegPro sync attempts record `sync_events` errors without deleting demo data

## Post-deploy smoke

- [ ] Login → varieties list → edit variety → preview passport
- [ ] Public passport for a visible demo variety
- [ ] Admin analytics loads (staff session)
- [ ] `GET /api/qr/VP-0001?format=png` returns 200 for public variety

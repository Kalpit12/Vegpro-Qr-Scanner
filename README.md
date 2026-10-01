# VegPro Digital Flower Passport

Foundation for the VegPro Digital Flower Passport platform: stable variety identity, demo data provider abstraction, and future VegPro integration readiness.

## Stack

- Next.js (App Router)
- TypeScript
- PostgreSQL
- Drizzle ORM
- Auth.js
- Tailwind CSS + shadcn/ui
- Zod

## Phase status

This repository implements the Digital Flower Passport platform through **Phase 9** (V1 release hardening). **VegPro integration is not configured yet** — see [docs/INTEGRATION.md](docs/INTEGRATION.md). Pre-release steps: [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md).

## Environment variables

Copy `.env.example` to `.env.local` and adjust values:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vegpro_passport
AUTH_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:5001
```

Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

**Note:** If `NEXT_PUBLIC_APP_URL` is set in your OS/shell environment (for example `localhost:3000`), it can override `.env.local`. Remove it or rely on this project's `next.config.ts`, which reloads `.env.local` with priority.

## Local setup

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:5001](http://localhost:5001).

## Demo data

Seed data is **fictional** and labeled with source system `Demo`. Timestamps reflect the seed run, not VegPro synchronization. Example varieties:

- Explorer (`VP-0001`)
- Red Velvet (`VP-0002`)
- Sweet Aurora (`VP-0003`)

Demo admin user:

- Email: `admin@demo.vegpro.local`
- Password: `DemoAdmin123!`

## Architecture

```text
PostgreSQL (demo source today)
        ↓
FlowerDataProvider (demo-postgres / MockFlowerDataProvider)
        ↓
Canonical Flower model
        ↓
Admin / Public services
        ↓
Public routes + APIs
```

Future VegPro flow (not active):

```text
VegPro source (TBD)
        ↓
SourceAdapter + SyncService → sync_events
        ↓
FlowerDataProvider (vegpro-api when configured)
        ↓
Same Flower / PublicFlower / Passport / QR stack
```

Details: [docs/INTEGRATION.md](docs/INTEGRATION.md) · Webhook placeholder: [docs/WEBHOOK_BOUNDARY.md](docs/WEBHOOK_BOUNDARY.md)

Stable public identifiers (`VP-0001`, …) use PostgreSQL sequence `flower_public_identifier_seq`. **`VP-####` is platform-owned** and stays fixed when VegPro external IDs change.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run db:generate` — generate Drizzle migrations from schema
- `npm run db:migrate` — apply migrations (includes `0003` category FK + parameter validation config)
- `npm run db:seed` — load demo data
- `npm run qa:phase6` — Phase 6 analytics Playwright suite
- `npm run qa:phase7` — breeding/public privacy checks
- `npm run qa:phase8` — integration boundary checks
- `npm run qa:phase9` — V1 security + acceptance Playwright
- `npm run qa:v1` — run phase 7, 8, 9, then 6 regression scripts

## Public API (foundation)

`GET /api/public/flowers/VP-0001` returns a public-safe DTO via `toPublicFlower()`.

Admin APIs require authentication:

- `GET /api/flowers`
- `POST /api/flowers`
- `PATCH /api/flowers/:id`

## QR codes (Phase 3)

Each variety QR encodes a **stable URL only**:

```text
{NEXT_PUBLIC_APP_URL}/flowers/{publicIdentifier}
```

Example: `http://localhost:5001/flowers/VP-0001`

- `GET /api/qr/VP-0001?format=png`
- `GET /api/qr/VP-0001?format=svg`
- Append `&download=1` for attachment downloads

No separate QR database table — codes are generated deterministically from `publicIdentifier` and `NEXT_PUBLIC_APP_URL`.

**Deployment note:** If `NEXT_PUBLIC_APP_URL` changes after QR codes are printed, physical codes will still point at the old domain until reprinted. Domain migration logic is out of scope for Phase 3.

### Testing QR codes from a physical phone

QR payloads are built only from `NEXT_PUBLIC_APP_URL` + `/flowers/{publicIdentifier}` (see `buildFlowerPublicUrl()` in `src/lib/flower-public-url.ts` and `src/services/qr.ts`). The stable `VP-####` identifier does not change when the base URL changes.

`localhost` in the admin panel is correct for browser use on the same machine. A phone on the network **cannot** reach `localhost` on your PC.

**Procedure (local dev):**

1. Run the app (`npm run dev`, default port **5001**).
2. Find your computer's LAN address (e.g. `ipconfig` on Windows → IPv4 under your Wi‑Fi adapter).
3. Set in `.env.local` (do not commit secrets):
   ```env
   NEXT_PUBLIC_APP_URL=http://192.168.x.x:5001
   ```
   Use your actual LAN IP; do not hardcode this value in application code.
4. Restart the dev server so Next.js picks up the env change.
5. Open admin → variety → confirm **Public URL** shows `http://192.168.x.x:5001/flowers/VP-0001`.
6. Scan the QR with a phone on the **same Wi‑Fi**; it should open the public passport route.
7. Optional: use a tunnel (e.g. ngrok, Cloudflare Tunnel) and set `NEXT_PUBLIC_APP_URL` to the tunnel HTTPS origin, then restart.

**Production:** set `NEXT_PUBLIC_APP_URL=https://your-production-domain` in the hosting environment and redeploy. Regenerate or re-download QR assets after changing the base URL.

**Verify API:** `GET /api/qr/VP-0001?format=png` encodes the same URL as shown in the admin panel.

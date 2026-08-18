# Emma Garces — Modeling Portfolio

Production-ready portfolio and private content studio for Emma Garces. The existing editorial design and Export Studio are preserved while the runtime is migrated to a conventional stack Emma can own: Next.js on Vercel, Neon PostgreSQL, private Vercel Blob storage, and GitHub OAuth through NextAuth.

## Architecture

- **Framework:** Next.js 16 App Router with React 19 and TypeScript
- **Hosting target:** Vercel
- **Database:** Neon PostgreSQL through Drizzle ORM and the Neon serverless driver
- **Media:** private Vercel Blob objects, delivered through the authorization-aware `/api/media` route
- **Authentication:** GitHub OAuth through NextAuth; access is restricted to `ADMIN_EMAIL`
- **Public route:** `/`
- **Protected routes:** `/studio`, `/exports`, portfolio writes, uploads, private media reads, and deletes

The app no longer requires ChatGPT Sites, ChatGPT identity headers, Cloudflare Workers, D1, R2, Vinext, Vite, Wrangler, or any other OpenAI-hosted runtime service.

## Local setup

Prerequisites: Node.js 22.13 or later, pnpm 11, a Neon database, a Vercel Blob store, and a GitHub OAuth app.

1. Copy `.env.example` to `.env.local` and fill in the real credentials. Never commit `.env.local`.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Generate and apply the database migration, then seed the initial portfolio:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

4. Start the app:

   ```bash
   pnpm dev
   ```

5. Open `http://localhost:3000`. The public portfolio needs no account. Open `/studio` to authenticate.

For credential-free local visual QA only, set `PORTFOLIO_DEMO_MODE=true` and `AUTH_BYPASS_FOR_LOCAL_TESTS=true`. Those switches work only outside production and are not a storage or authentication strategy.

## Using Portfolio Studio

Sign in at `/studio` with the allowlisted GitHub account. The sidebar preserves the existing workflow: update Profile and Measurements, enter and verify Runway Credits, upload/classify Media, add Runway Video links, choose public/featured content in Portfolio Settings, then save a draft or publish. Preview opens the public portfolio in a separate tab. Export Studio opens the existing Portfolio PDF, Comp Card, Credits Sheet, Digital Package, and Dubai Submission layouts; use the browser print dialog to save a PDF.

Uploads begin as private. Mark an asset public only when it is approved for the public portfolio, select the strongest approved image as the hero, save, and verify the signed-out homepage before sharing it.

## GitHub OAuth

Create a GitHub OAuth app with:

- Homepage URL: `http://localhost:3000` locally, then the production domain
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github` locally
- Production callback URL: `https://YOUR_DOMAIN/api/auth/callback/github`

Set `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET`, and `ADMIN_EMAIL`. The authenticated GitHub account must expose an email matching the allowlist. Multiple administrators can be comma-separated, although this project is configured for a single owner.

## Vercel setup

1. Create Emma's GitHub repository and push this project when ready.
2. In Emma's Vercel account, import that repository as a Next.js project.
3. Connect a Neon database and a private Vercel Blob store.
4. Add every variable from `.env.example` for Production and Preview as appropriate. Set `NEXTAUTH_URL` and `SITE_URL` to the production URL.
5. Run `pnpm db:migrate` against the production `DATABASE_URL`, then `pnpm db:seed` only for a new empty database.
6. Deploy, test the public portfolio, sign-in, editing, upload/delete, and every Export Studio format before changing DNS.

Vercel supplies `BLOB_READ_WRITE_TOKEN` when the Blob store is connected. Use a pooled Neon connection string for `DATABASE_URL`.

## Existing D1 and R2 migration

The migration is intentionally two-stage so content metadata and binary media remain auditable.

1. Export the current portfolio JSON/D1 row. With authorized Cloudflare access, run `SELECT data FROM portfolio_state WHERE id = 1` in the D1 console and download the result as JSON, or use Wrangler's remote D1 execute command with JSON output. Also export `media_objects` metadata for reconciliation. The importer accepts raw `PortfolioData`, `{ "portfolio": ... }`, a D1 `{ "data": "...json..." }` row, or a D1 results wrapper:

   ```bash
   pnpm migrate:d1 -- --portfolio ./migration-input/portfolio.json
   ```

   An optional media metadata JSON object keyed by the old R2 key can add MIME types and byte sizes:

   ```bash
   pnpm migrate:d1 -- --portfolio ./migration-input/portfolio.json --media-metadata ./migration-input/media.json
   ```

2. Export R2 objects to a local directory with Cloudflare's S3-compatible API or an authorized sync tool, preserving every object-key path. Then upload them to private Blob and update Neon references:

   ```bash
   pnpm migrate:r2 -- --directory ./migration-input/r2 --map ./migration-input/blob-map.json
   ```

3. Compare counts, spot-check every category, open the hero image, test a private asset while signed out, and verify all Export Studio documents before treating the migration as complete.

These scripts do not scrape Instagram. Only content supplied by Emma or exported from the existing app should be imported.

## Data model and future content

Portfolio metadata is normalized across profiles, settings, runway credits, media assets, and videos. `content_sections` is included as an extensible structured store for future sections such as About Emma, Modeling Journey, Selected Archive, Fashion Weeks, Designers, Campaigns, Beauty, Dubai, and International Availability. Adding those sections later does not require replacing the portfolio shell.

## Commands

- `pnpm dev` — local Next.js development server
- `pnpm build` — production build
- `pnpm start` — run a production build
- `pnpm typecheck` — strict TypeScript validation
- `pnpm lint` — ESLint validation
- `pnpm test` — Vitest suite
- `pnpm db:generate` — generate PostgreSQL migrations from the Drizzle schema
- `pnpm db:migrate` — apply PostgreSQL migrations
- `pnpm db:seed` — seed an empty database
- `pnpm migrate:d1` — import portfolio metadata from a D1/JSON export
- `pnpm migrate:r2` — upload an R2 directory to private Vercel Blob and update keys

Run the complete local validation sequence with:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Future GitHub workflow

This task intentionally does not create or push a remote. After creating an empty repository in Emma's GitHub account, connect and push this existing local history:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USER/emma-garces-portfolio.git
git branch -M main
git push -u origin main
```

If a remote named `origin` already exists, inspect it with `git remote -v` and use `git remote set-url origin ...` only after confirming it is the intended repository.

## Security notes

- The homepage receives a server-sanitized public data shape; private contact and modeling fields are removed before rendering.
- Every write and delete route verifies the administrator session server-side.
- Private Blob URLs are never used directly in portfolio records. Media streams through `/api/media`, which checks database visibility and authentication.
- Upload tokens are issued only after authentication, with a 50 MB limit and an explicit image/video MIME allowlist.
- Keep Neon, Blob, OAuth, and auth-secret values only in local/Vercel environment settings.

# Master Memory — Emma Garces Modeling Portfolio

Read this file first when continuing the project in another Codex/ChatGPT account or on another computer. It is the durable handoff for the work completed in the original session.

## Owner and project intent

- Owner/model: Emma Garces
- Age supplied by Emma: 22
- Instagram supplied by Emma: `https://www.instagram.com/_emmagarces_`
- Existing hosted site at the time of migration: `https://emma-garces-portfolio.garcesemma2018.chatgpt.site/`
- Eventual intended domain: `https://emmagarces.com`
- Primary goal: preserve the existing professional modeling portfolio design and functionality while making the source, hosting, data, media, and authentication independently maintainable by Emma.

Critical standing instruction: **do not redesign or rebuild the portfolio UI.** Preserve its typography, layouts, colors, galleries, responsive character, Portfolio Studio, Export Studio, print layouts, and overall editorial aesthetic unless a narrowly scoped technical fix is necessary.

Do not invent modeling credits, measurements, biography claims, agency relationships, contact details, or other personal information. Do not scrape Instagram. Emma will add approved information and media through Studio later.

## What the original session accomplished

The original ChatGPT Sites/Cloudflare application was inspected and migrated locally to a conventional owner-controlled stack:

- Native Next.js 16.3.1 App Router
- React 19.2.6
- TypeScript
- Tailwind CSS 4 plus the preserved custom portfolio stylesheet
- Neon PostgreSQL
- Drizzle ORM
- Private Vercel Blob storage
- NextAuth 4 with GitHub OAuth
- Single-owner administrator email allowlist
- Vercel-compatible production runtime
- pnpm as the sole package manager

The migration implementation commit is:

```text
1339eedb9f314b2d0b6c2548b206ec918ea81745
Migrate portfolio to Vercel Neon and Blob
```

This was a local migration only. No GitHub repository was created, no remote was configured, no Vercel project was deployed, no production database or Blob store was created, and no domain was purchased or connected.

## Preserved user-facing functionality

The following existing experiences remain intact:

- Public portfolio homepage at `/`
- Editorial hero and profile layout
- Runway, editorial, beauty, digitals, video, credits, availability, and contact sections
- Private Portfolio Studio at `/studio`
- Profile and contact editing
- Measurements management
- Runway-credit management and verification state
- Media upload, classification, featured/public status, hero selection, focal point, captions, photographer, and deletion
- Runway video management
- Portfolio settings and selected services
- Draft saving and publishing timestamp behavior
- Export Studio at `/exports`
- Portfolio PDF print layout
- Comp Card
- Runway Credits Sheet
- Digital Package
- Dubai Model Submission

The components carrying most of the preserved design are:

- `app/components/PublicPortfolio.tsx`
- `app/components/PortfolioStudio.tsx`
- `app/components/ExportView.tsx`
- `app/globals.css`

Avoid broad rewrites of these files.

## Architecture now in the repository

### Application

This is now a native Next.js application. It no longer uses Vinext, Vite, Cloudflare Workers, ChatGPT Sites runtime metadata, ChatGPT identity headers, D1 bindings, or R2 bindings.

Important entry points:

- `app/page.tsx` — server-loads and sanitizes the public portfolio
- `app/studio/page.tsx` — protected Studio page
- `app/exports/page.tsx` — protected Export Studio
- `app/layout.tsx` — configurable SEO, canonical URL, Open Graph, and social metadata
- `next.config.ts` — native Next.js configuration

The npm scripts deliberately use the supported Webpack path for `dev` and `build`. The local macOS execution environment could not allow Turbopack's CSS worker to bind its internal port, while the Webpack production build passed cleanly.

### Database

Neon PostgreSQL is accessed through the Neon serverless driver and Drizzle ORM.

Important files:

- `db/client.ts`
- `db/schema.ts`
- `db/portfolio-repository.ts`
- `drizzle.config.ts`
- `drizzle/0000_sour_black_bolt.sql`

Normalized tables:

- `profiles`
- `portfolio_settings`
- `runway_credits`
- `media_assets`
- `portfolio_videos`
- `content_sections`

`db/portfolio-repository.ts` translates normalized rows back into the original `PortfolioData` shape so the preserved UI did not require a redesign.

`content_sections` was added to make future sections possible without another migration crisis. Planned concepts include About Emma, Modeling Journey, Selected Archive, Selected Runway, Fashion Weeks, Designers, Editorial, Campaigns, Beauty, Dubai, and International Availability.

### Public-data privacy

`lib/portfolio.ts` contains `toPublicPortfolio()`. It is an important privacy boundary, not just a rendering helper. It removes hidden profile fields, private media/videos/credits, internal booking/contact details, TikTok/website values without a public visibility control, internal runway-credit notes, venue details, designer-base notes, and inaccessible hero selections before data reaches the public page or public API caller.

Do not weaken this sanitizer. Public users should receive only explicitly public content.

### Media

Media is designed for **private Vercel Blob storage**.

Important files:

- `lib/media-storage.ts` — storage abstraction
- `lib/media-access.ts` — read policy
- `app/api/media/route.ts` — authorized stream/delete route
- `app/api/media/upload/route.ts` — authenticated client-upload token generation

Blob object URLs are not stored as publicly usable URLs. Portfolio records use a storage pathname and an application URL shaped like `/api/media?key=...`. The route looks up visibility in PostgreSQL before streaming the private object.

Uploads require authentication, accept an explicit image/video MIME allowlist, and have a 50 MB per-file limit. Newly uploaded Studio assets begin private. The metadata becomes durable when the portfolio draft is saved.

### Authentication

Authentication uses NextAuth 4 with GitHub OAuth because there was no existing Clerk integration.

Important files:

- `lib/auth.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `app/auth/signin/page.tsx`
- `app/auth/signin/SignInButton.tsx`

Rules:

- `/` remains public.
- `/studio` requires an administrator session.
- `/exports` requires an administrator session.
- Portfolio writes require authentication.
- Upload-token generation requires authentication.
- Media deletion requires authentication.
- Private media reads require authentication.
- GitHub account email must match `ADMIN_EMAIL` case-insensitively.

Two environment switches exist only for credential-free local visual QA:

- `PORTFOLIO_DEMO_MODE=true`
- `AUTH_BYPASS_FOR_LOCAL_TESTS=true`

Both are explicitly ignored when `NODE_ENV=production`; they must never be used as production persistence or authentication.

## Required environment variables

Names and placeholder formats are recorded in `.env.example`. No real credentials were present or committed in the original session.

Required service variables:

```text
DATABASE_URL
BLOB_READ_WRITE_TOKEN
ADMIN_EMAIL
AUTH_SECRET
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
NEXTAUTH_URL
SITE_URL
SITE_TITLE
SITE_DESCRIPTION
SOCIAL_IMAGE_PATH
```

The new computer/account must obtain real values from Emma's Neon, Vercel Blob, GitHub OAuth, and Vercel accounts. Transfer secrets through an appropriate password manager or secure channel, never through Git history or this memory file.

## Migration and seed tooling

- `pnpm db:generate` — generate Drizzle migrations after schema changes
- `pnpm db:migrate` — apply migrations to `DATABASE_URL`
- `pnpm db:seed` — seed the initial portfolio and future content placeholders
- `pnpm migrate:d1 -- --portfolio FILE` — transform/import an existing D1 portfolio JSON export into Neon
- `pnpm migrate:r2 -- --directory DIRECTORY --map FILE` — upload an exported R2 directory to private Blob and update Neon media keys

The D1 importer accepts raw `PortfolioData`, a `{ portfolio: ... }` wrapper, a D1 row whose `data` field contains JSON, or a D1 results wrapper. An optional `--media-metadata` JSON file can supply MIME types and sizes keyed by the old R2 key.

No production D1 or R2 data was available locally, so no real content was fabricated or migrated. An authorized maintainer still needs to export `portfolio_state`, reconcile `media_objects`, export the R2 objects while preserving their keys, and run the documented import sequence.

## Tests and validation completed

The discarded starter-screen test was replaced with six focused test files:

- `tests/public-portfolio.test.tsx`
- `tests/auth.test.ts`
- `tests/portfolio.test.ts`
- `tests/database-persistence.test.ts`
- `tests/media-authorization.test.ts`
- `tests/api-authorization.test.ts`

The final validation result in the original session:

```text
TypeScript: passed
ESLint: passed with zero errors or warnings
Vitest: 6 test files passed, 7 tests passed
Next.js production build: passed
git diff --check: passed
```

Browser QA completed against the local application:

- Desktop public homepage rendered correctly.
- iPhone-sized public homepage rendered correctly.
- Mobile navigation opened and closed correctly.
- A mobile blend-mode bug was found and fixed so the menu has a solid background and usable close control.
- Desktop Portfolio Studio rendered correctly.
- Mobile Portfolio Studio and its sidebar drawer rendered correctly.
- Editing a profile field, saving, reloading, and reading the saved value succeeded in development persistence mode.
- Dubai Model Submission export rendered correctly.
- Signed-out `/studio` redirected to `/auth/signin?callbackUrl=%2Fstudio`.
- Signed-out portfolio PUT, media DELETE, and upload-token POST returned HTTP 401.

Not validated against real external services because credentials were intentionally unavailable:

- Real Neon migration/persistence
- Real Vercel Blob upload/download/delete
- Real GitHub OAuth callback
- Vercel Preview and Production deployments
- Production PDF printing on Vercel
- Final tablet/device matrix after deployment

## Portable setup on the new computer

To transfer the complete Git history without depending on either account's GitHub access, create a portable Git bundle on the original computer:

```bash
git bundle create ../emma-garces-portfolio.bundle --all
```

Copy that single bundle file to the new computer, then reconstruct the repository there:

```bash
git clone emma-garces-portfolio.bundle Emma-Garces-Portfolio
cd Emma-Garces-Portfolio
git log -2 --oneline
```

This transfers every committed source file and commit, including this memory, while excluding secrets and reproducible machine caches.

After cloning or copying the Git repository:

```bash
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install
cp .env.example .env.local
```

Fill `.env.local` with real credentials locally. Do not commit it.

For a new empty Neon database:

```bash
pnpm db:migrate
pnpm db:seed
```

Run locally:

```bash
pnpm dev
```

Validate before any new commit:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Generated/ignored directories are intentionally not portable source state and must be recreated rather than committed:

- `node_modules/` — recreated by `pnpm install`
- `.next/` — recreated by `pnpm dev` or `pnpm build`
- `.pnpm-store/` — local package cache
- `.vinext/`, `.wrangler/`, and `dist/` — obsolete/generated output from the old runtime and safe to omit

At the handoff point there was no `.env.local` file in the project, so no uncommitted secret file needs to be recovered from the original machine.

## Manual setup still required

1. Create Emma's GitHub repository; do not create a second unrelated project history.
2. Push this existing repository history to it.
3. Create or select Emma's Neon project and obtain the pooled PostgreSQL URL.
4. Create/connect a private Vercel Blob store.
5. Create a GitHub OAuth app.
6. For local auth, use callback `http://localhost:3000/api/auth/callback/github`.
7. For production auth, use callback `https://YOUR_DOMAIN/api/auth/callback/github`.
8. Import the GitHub repository into Emma's Vercel account as a Next.js project.
9. Add all environment variables in Vercel.
10. Apply the database migration and seed only if appropriate for an empty database.
11. Export and migrate real D1/R2 content using the included scripts.
12. Test public/private content, OAuth, editing, upload/delete, every export, mobile/tablet/desktop behavior, and metadata on the temporary Vercel URL.
13. Connect `emmagarces.com` only after Preview and Production are verified.

No `vercel.json` is required for this standard native Next.js deployment.

## GitHub commands for the eventual owner repository

After Emma creates an empty repository:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USER/emma-garces-portfolio.git
git branch -M main
git push -u origin main
```

If `origin` already exists, inspect it first with `git remote -v`. Use `git remote set-url origin ...` only after confirming the new URL is Emma's intended repository.

## Guidance for the next agent

1. Read this file and `README.md` before modifying anything.
2. Inspect `git log`, `git status`, and configured remotes before taking action.
3. Treat the migration commit as the known-good local baseline.
4. Preserve the existing UI unless Emma explicitly requests a design change.
5. Never invent Emma's portfolio facts or scrape Instagram.
6. Never commit `.env.local`, service tokens, database credentials, OAuth secrets, dependencies, build output, or package caches.
7. Prefer extending `db/portfolio-repository.ts` over coupling UI components directly to PostgreSQL.
8. Keep private Blob access behind the application authorization route.
9. Keep `toPublicPortfolio()` as the server-side public-response boundary.
10. Run typecheck, lint, tests, production build, and responsive browser QA after material changes.
11. Do not claim production migration is complete until Neon, Blob, OAuth, Vercel, migrated data, and the deployed site have all been verified.

## Phase 1 talent-platform additions

Implemented on top of the migrated stack, without replacing Studio, media, or the public editorial layout:

- Public `/book` inquiry form persisted to `booking_inquiries`
- Studio Inquiries triage and status updates
- Public `/comp-card` generated from current public profile/media
- Studio Comp card image selection
- Availability status on public homepage, edited in Studio settings
- HARFT AI footer attribution using official logos in `public/partners/`
- SEO: unique titles, sitemap, robots, JSON-LD Person/WebSite, noindex for Studio/auth/exports
- Vercel Web Analytics event names; inquiry counts in Studio from PostgreSQL

Apply additive migration `0001_uneven_krista_starr` before production deploy. Do not run seed. Do not implement Phase 2 collections, private casting links, or the HARFT-powered assistant.

## Repository state at handoff

Before this memory file was added, the repository was clean on branch `main` at migration commit `1339eedb9f314b2d0b6c2548b206ec918ea81745`. This memory file is intended to be committed as a separate handoff commit. Use `git log -2 --oneline` on the receiving computer to confirm both commits arrived.

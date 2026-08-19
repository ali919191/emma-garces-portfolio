# CLAUDE.md — Emma Garces Portfolio

## ⚠️ Mandatory: read `/PROJECT_MASTER.md` first

Before planning, modifying, migrating, deploying, or materially changing this project, read
`/PROJECT_MASTER.md`. It is the authoritative source for architecture, design constraints,
privacy rules, active phase, roadmap, and deployment policy.

**Do not implement work outside the `ACTIVE_PHASE` unless explicitly authorized by the user.**

**After any material implementation or production deployment, update `PROJECT_MASTER.md`** so it
reflects the new project state. A deployment is not complete until the master document matches
reality.

Do not duplicate `PROJECT_MASTER.md` content here. This file is a pointer, not a copy.

---

## Non-negotiables (full detail in `PROJECT_MASTER.md`)

- **The editorial design is frozen.** Do not redesign the UI. Avoid broad rewrites of
  `app/components/PublicPortfolio.tsx`, `app/components/PortfolioStudio.tsx`,
  `app/components/ExportView.tsx`, or `app/globals.css`. — §4
- **Never invent Emma's facts.** No fabricated credits, measurements, biography, agency
  relationships, or contact details. Never scrape Instagram. Emma adds approved content through
  Studio. — §1, §6
- **`toPublicPortfolio()` in `lib/portfolio.ts` is the public privacy boundary.** Do not weaken
  it. Public AI surfaces consume its output, never raw portfolio data. — §6
- **Phase 1 is COMPLETE / FROZEN.** Change it only for bugs, security issues, or explicitly
  authorized small enhancements. — §7
- **Studio is the approval gate. AI proposes; Emma approves.** No autonomous publishing, no
  autonomous outreach. — §6
- See §12 for the full list of prohibited and deferred work (synthetic likeness, any
  appearance/body/marketability scoring, face recognition, chatbot-as-flagship, speculative
  infrastructure, major redesign).

## Working rules

- **pnpm only** (`pnpm@11.19.0`). Node ≥ 22.13.
- Validate before any commit or deploy:
  ```bash
  pnpm typecheck && pnpm lint && pnpm test && pnpm build
  ```
- `dev` and `build` intentionally use `--webpack`. Do not switch to Turbopack without
  re-testing — see §3.
- Prefer extending `db/portfolio-repository.ts` over coupling UI components directly to
  PostgreSQL.
- Migrations must be additive. Never rerun `pnpm db:seed` against a populated database.
- Never commit `.env.local`, `.vercel/`, tokens, credentials, `node_modules`, or build output.
- Deployment follows the 10-step Deployment Constitution in `PROJECT_MASTER.md` §14.

## Historical documents

`master_memory.md` and `harft-ai-innovation-assessment.md` are retained for provenance and are
**superseded by `PROJECT_MASTER.md`**. Do not treat them as current-state documents.

# Deployment

Added by `scripts/postinstall/setup-deploy.sh` (`vercel.json`, finalized
`.env.example`) and `scripts/postinstall/setup-ci.sh` (GitHub Actions).

## Vercel

`vercel.json`'s `buildCommand` runs
`npx prisma generate && npx prisma migrate deploy && next build` — pending
migrations are applied automatically as part of every deployment, before
the new build goes live, so the database schema and the deployed code
never drift apart.

Setup (manual, one-time — this needs your own Vercel/GitHub accounts, so it
isn't scripted):
1. Push the generated project to a GitHub repo.
2. Vercel → **New Project** → import that repo (Next.js is auto-detected).
3. Copy every variable from `.env.example` into **Project Settings →
   Environment Variables** with real values, for both Production and
   Preview.
4. Custom domain: **Project Settings → Domains** → add the domain → create
   the CNAME/A record Vercel gives you at your DNS provider. Propagation
   can take up to 24-48 hours; Vercel auto-provisions the TLS certificate
   once the record resolves.
5. Every push to the connected branch triggers a new deployment.

## CI (GitHub Actions)

- **`.github/workflows/ci.yml`** — on every push/PR: install, `prisma
  generate`, lint, `tsc --noEmit`, tests (if any), `npm audit
  --audit-level=high`, and a `gitleaks` scan job.
- **`.github/workflows/codeql.yml`** — CodeQL static analysis on push/PR
  and a weekly schedule.
- **`.github/dependabot.yml`** — weekly dependency-update PRs for both npm
  packages and the GitHub Actions themselves.

Private repos on some GitHub plans need CodeQL/secret-scanning features
enabled explicitly in **Settings → Code security** — if `codeql.yml` fails
to run at all (rather than failing its checks), that's the first place to
look.

## Common pitfalls

- Forgetting to copy `.env.example` values into Vercel — the build will
  fail on the same env validation this scaffold uses locally, just later
  and more confusingly than it needs to.
- Running `prisma migrate dev` anywhere near production — always
  `migrate deploy` outside local development (see `database.md`).
- Pointing `DATABASE_URL` at a non-pooled connection string under Vercel's
  serverless functions — see the connection-pooling section of
  `database.md`.

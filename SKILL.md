---
name: website-scaffold
description: >
  Scaffolds a complete, secure, production-ready Next.js + Postgres website —
  or adds a missing piece to one that already exists. Use this whenever the
  user wants to start a new website/webapp project, needs a landing page plus
  an admin dashboard, says "set up a new site," or wants to add
  authentication/login, wire up Stripe payments or subscriptions, send
  transactional email, harden security, set up CI checks, or deploy to Vercel
  with a custom domain. Generates a hardened baseline by default: managed auth
  (Clerk or Auth.js), Prisma + Postgres, Stripe webhooks with signature
  verification, Resend email templates, zod-validated environment variables,
  CSP/HSTS security headers, rate limiting on auth/API routes, and CI checks
  (npm audit, gitleaks, CodeQL) — so auth and security are never hand-rolled
  from scratch.
---

# Website Scaffold

Scaffolds a hardened Next.js (App Router) + Postgres website — landing page,
admin dashboard, auth, payments, email, security, CI, and deployment — or
adds one of those pieces to an existing project. All real work happens in
`scripts/` and is documented in `references/`; this file is the orchestrator
only.

## 1. Detect mode

Check the target directory:

- No `package.json` / no `next.config.*` → **new project** mode.
- Existing Next.js project → **addition** mode (jump to step 6).

## 2. Scope the build (new project)

Ask a compact set of questions, all with sensible defaults so most users can
accept and move on:

| Question | Default |
|---|---|
| Project name / target directory | (required) |
| Auth provider: Clerk or Auth.js/NextAuth | Clerk |
| Payments needed now? (Stripe) | yes |
| Transactional email needed now? (Resend) | yes |
| Rate-limit backend: Upstash Redis or in-memory (local-only) | Upstash |
| Package manager | npm |

## 3. Run the scaffold script

```
scripts/init-site.sh <project-name> \
  --auth=clerk|authjs \
  --payments=yes|no \
  --email=yes|no \
  --ratelimit=upstash|memory
```

This generates the full project: route groups for the landing page and admin
dashboard, Prisma schema, the chosen auth provider wired to protect the admin
group, payments/email modules if requested, security middleware, CI
workflows, and deployment config. See `references/architecture.md` for what
the generated layout looks like and why.

## 4. Surface manual steps

The script prints a checklist of accounts/keys the user still needs to create
(Clerk, Stripe, Resend, Vercel, a Postgres database). Relay this checklist
plainly. Offer to populate `.env` once the user supplies values — never
invent placeholder secrets that look real.

## 5. Verify

```
scripts/verify-site.sh <project-dir>
```

Fix anything this script flags before declaring the scaffold done. It proves
the project actually installs, builds, and that the admin route redirects
unauthenticated visitors to sign-in — not just that it typechecks.

## 6. Addition mode (existing project)

For "add auth to my site" / "add payments" / "set up CI" style requests, skip
`init-site.sh` and run only the matching script directly against the existing
project:

```
scripts/postinstall/setup-auth.sh <project-dir> --auth=clerk|authjs
scripts/postinstall/setup-db.sh <project-dir>
scripts/postinstall/setup-payments.sh <project-dir>
scripts/postinstall/setup-email.sh <project-dir>
scripts/postinstall/setup-security.sh <project-dir>
scripts/postinstall/setup-ci.sh <project-dir>
scripts/postinstall/setup-deploy.sh <project-dir>
```

Each script checks for existing config before changing anything (see the
script's own comments), so they're safe to run against a project that already
has some of these pieces.

## 7. Report back

Summarize what was generated or changed, which env vars still need real
values, and any remaining manual dashboard/DNS steps. Point at the relevant
`references/<topic>.md` for anything that needs deeper explanation.

## 8. Before hand-editing generated code

Load the matching reference doc first — these cover the *why*, not just the
*what*, and call out the common ways each area gets broken:

- `references/architecture.md` — overall layout and conventions
- `references/design.md` — color/type tokens, shadcn/ui setup, reskinning
- `references/database.md` — Prisma/Postgres conventions, migrations, pooling
- `references/auth.md` — Clerk and Auth.js setup, route protection
- `references/payments.md` — Stripe checkout/subscriptions/webhooks
- `references/email.md` — Resend setup, domain verification, templates
- `references/security.md` — headers, rate limiting, CSRF, secrets hygiene
- `references/deployment.md` — Vercel, env vars, custom domains, CI

# Security

Added by `scripts/postinstall/setup-security.sh`, called automatically (and
unconditionally) from `init-site.sh`. This is the pass that ties the rest of
the generated code together defensively.

## Security headers (`middleware.ts`)

Applied to every response: `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`,
`Strict-Transport-Security`, and a `Content-Security-Policy` scoped to
`'self'` plus the specific third-party origins the scaffold actually uses
(Stripe.js/Checkout). **If you add another third-party script or embed**,
you must widen the CSP in `middleware.ts` accordingly — the default is
intentionally strict, and a script silently failing to load is the sign to
look here first.

## Rate limiting (`lib/rate-limit.ts`)

Two named limiters, `authRateLimit` (5/min) and `apiRateLimit` (60/min),
applied at sign-in/sign-up/password-reset and at mutating API routes
respectively. Backend is chosen via `--ratelimit=upstash|memory`:

- **Upstash** (default): a real distributed limiter backed by Upstash
  Redis — correct across multiple serverless instances. Requires
  `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (Upstash console →
  Redis database → REST API).
- **memory**: an in-process `Map`, fine for local development only — each
  serverless instance/lambda would keep its own counters, so it does not
  give a real global limit in production.

## CSRF / origin checks (`lib/csrf.ts`)

Next.js Server Actions already get CSRF protection from the framework
(same-origin `Origin` header enforcement). Hand-written Route Handlers
under `app/api` don't get this automatically, so every state-changing route
this scaffold generates (`/api/checkout`, `/api/register`,
`/api/reset-password/*`) calls `checkOrigin(req)` first and rejects a
mismatched `Origin` header. This is defense-in-depth on top of the
authentication check already required by each route — it stops a
third-party page from riding the visitor's session cookie to call these
endpoints via a CSRF-style attack.

## Input validation

Every route handler that accepts a body validates it with `zod`
(`bodySchema.safeParse(...)`) before touching the database or Stripe —
malformed or unexpected fields are rejected with `400` rather than being
passed through.

## Environment variable validation (`lib/env.ts`)

- Build-time variables (things `next build` itself needs, or that are
  `NEXT_PUBLIC_*` and therefore baked into the client bundle) are validated
  eagerly at import time — a missing one fails the build immediately
  instead of surfacing as a confusing runtime error later.
- Runtime-only secrets (`STRIPE_SECRET_KEY`, `RESEND_API_KEY`, ...) are
  validated lazily via `getRuntimeEnv()`, so `next build` doesn't require
  every third-party key to exist in environments (like CI) where they
  legitimately aren't configured yet.

## Secrets hygiene

- Never prefix a secret with `NEXT_PUBLIC_` — that inlines it into the
  client JS bundle.
- `.env.example` documents every variable's *name*; real values only ever
  live in `.env` (gitignored by `create-next-app` by default — it ignores
  `.env*`) or in Vercel's environment variable store — never in a committed
  file. Use `.env`, not `.env.local`: the Prisma CLI (`migrate`/`generate`)
  only reads `.env` by default, while Next.js reads both, so `.env` is the
  one file both tools agree on.
- Webhook payloads (`/api/webhooks/stripe`, `/api/webhooks/clerk`) are only
  trusted after signature verification — treat the payload as attacker
  -controlled until that check passes.

## CI-level scanning (see `deployment.md` for the workflow files themselves)

- `npm audit --audit-level=high` — dependency vulnerabilities.
- `gitleaks` — secrets accidentally committed.
- CodeQL — static analysis for common JS/TS vulnerability patterns.
- Dependabot — automated dependency update PRs.

None of these replace manual review; they catch the categories of mistake
that are easy to make and cheap to automate away.

## Common pitfalls

- Widening the CSP with `'unsafe-eval'` or a wildcard `*` source to make an
  error go away, instead of adding the specific origin that's actually
  needed.
- Rate-limiting by user ID only — also rate-limit by IP on unauthenticated
  endpoints (sign-up, password reset request), or an attacker just mints
  new identities to bypass the limit.
- Treating `memory` rate limiting as sufficient in a real deployment —
  switch to `upstash` before relying on it.

# Authentication

Two providers are supported; pick one per project via `--auth=clerk|authjs`.
Both protect the `(admin)` route group at `/dashboard` through
`middleware.ts`, and both mirror the signed-in user into the local `User`
table so other data (e.g. `Subscription`) can have a foreign key to it.

## Clerk (default)

- Hosted sign-in/sign-up UI (`app/sign-in`, `app/sign-up`), MFA, session
  management, and bot/breach protection are all handled by Clerk — none of
  that is code in this repo.
- `middleware.ts` uses `clerkMiddleware()` + `auth.protect()` to gate
  `/dashboard(.*)`.
- The local `User` row (`clerkId`, `email`) is a mirror, not the source of
  truth. Keep it in sync via a Clerk webhook: point **Clerk dashboard →
  Webhooks** at `/api/webhooks/clerk` for the `user.created` event (this is
  also what triggers the welcome email — see `email.md`). The webhook route
  verifies the payload with `svix` before trusting it.
- Required env vars: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
  (Clerk dashboard → API Keys), plus `CLERK_WEBHOOK_SECRET` if email is
  enabled.

**Pitfall**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` isn't just "any non-empty
string" — Clerk's SDK validates its format (it must decode to a real Clerk
Frontend API domain) and will throw at render time if it's malformed. A
placeholder value is enough to satisfy this scaffold's own env validation,
but `next build`/`next dev` will still fail until you set a real key from a
Clerk application. This is expected — it's the same for any Clerk app, not
specific to this scaffold.

## Auth.js (NextAuth), self-hosted alternate

- Root config lives in `auth.ts` (Auth.js v5 convention), using the
  `@auth/prisma-adapter` against the same Postgres database, with a
  `Credentials` provider (email + `bcrypt`-hashed password).
- `middleware.ts` checks `req.auth` on paths starting with `/dashboard` and
  redirects to `/api/auth/signin` if absent.
- Sign-up isn't built into Auth.js's Credentials provider, so this scaffold
  adds its own: `/sign-up` (page) → `POST /api/register` (hashes the
  password, creates the `User` row). Both are rate-limited by IP.
- Password reset (also not built in) is added on top: `/forgot-password` →
  `POST /api/reset-password/request` generates a token in the
  `VerificationToken` table (already part of the Auth.js Prisma schema) and
  emails a link; `/reset-password` → `POST /api/reset-password/confirm`
  validates the token and updates `passwordHash`. Both routes never reveal
  whether an email is registered.
- Required env var: `AUTH_SECRET` — generate with `npx auth secret`.
- Swap in an OAuth provider (Google, GitHub, ...) by adding it to the
  `providers` array in `auth.ts`; the Prisma adapter's `Account` model
  already supports it.

**Pitfall**: forgetting the `middleware.ts` `matcher` config means some
routes never pass through the auth check at all — always confirm a route is
actually covered by the matcher, don't assume "it's under `(admin)/`" is
sufficient by itself. The matcher deliberately excludes `/api/auth/*` —
running the `auth()` middleware wrapper over Auth.js's own routes causes the
built-in sign-in page to redirect to itself in a loop.

**Pitfall**: don't set `pages.signIn` in `auth.ts` to Auth.js's own default
route (`/api/auth/signin`). That option is for pointing at a *custom*
sign-in page; pointing it at the built-in route's own path makes Auth.js
treat it as a custom redirect target and loop. Omit `pages.signIn` entirely
to keep the built-in page, or set it to a real custom page you've built.

**Pitfall**: running `next start` (production mode) locally, or self-hosting
outside Vercel, can fail with `UntrustedHost` — Auth.js only trusts the
request host automatically in development or when deployed on Vercel
(which sets its own `VERCEL` env var). Self-hosting elsewhere needs
`AUTH_TRUST_HOST=true` or `AUTH_URL` set to your real domain.

## Common pitfalls (either provider)

- Doing the auth check only in a Server Component and not in
  `middleware.ts` — leaves API routes under `(admin)`-adjacent paths
  unprotected even if the pages redirect correctly.
- Exposing a secret key (`CLERK_SECRET_KEY`, `AUTH_SECRET`) via a
  `NEXT_PUBLIC_*` variable — only publishable/public keys should ever get
  that prefix.
- Trusting client-supplied user IDs instead of reading the authenticated
  identity from `auth()` / `currentUser()` on the server.

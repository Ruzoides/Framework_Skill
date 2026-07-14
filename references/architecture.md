# Architecture

## Layout

Generated projects use Next.js App Router route groups to separate the
public site from the authenticated area without affecting the URL path:

```
app/
├── (marketing)/          # public landing page — no auth required
│   ├── layout.tsx
│   ├── page.tsx           # composed from components/marketing/* sections
│   └── pricing/page.tsx  # only if payments enabled
├── (admin)/               # protected dashboard — auth required
│   ├── layout.tsx         # server-side auth check + components/admin/admin-shell
│   ├── dashboard/page.tsx
│   └── settings/page.tsx
├── api/
│   ├── health/route.ts    # unauthenticated liveness check
│   └── webhooks/stripe/route.ts   # only if payments enabled
└── middleware.ts          # route protection + security headers

components/
├── ui/          # vendored shadcn/ui primitives — see references/design.md
├── marketing/   # landing page sections (hero, pricing-teaser, faq, ...)
├── admin/       # admin shell, nav, stat cards, tables
└── numeric-text.tsx  # shared monospace/tabular-nums number wrapper
```

Route groups (`(name)`) don't appear in the URL — `(admin)/page.tsx` serves
`/`, so the actual admin path comes from a subpath like
`(admin)/dashboard/page.tsx` → `/dashboard`. Keep the admin route group under
a real path segment (e.g. `/admin` or `/dashboard`), not at the group root,
so `middleware.ts`'s path matcher has something concrete to match against.

## Why route groups instead of two separate apps

A single Next.js app with route groups shares one build, one deployment, one
set of environment variables, and one database connection pool — simpler to
operate than a separate marketing site and admin app. The tradeoff is that
both share a dependency tree; if that becomes a problem at scale, the
`(admin)` group can be extracted into its own app later without touching the
`(marketing)` group's code.

## Why Prisma

See `database.md` for the full comparison — short version: schema-first
migrations and a mature client outweigh Drizzle's edge-native footprint for a
scaffold meant to be reused unmodified across many projects.

## Conventions used throughout generated code

- All server-only secrets are read through `lib/env.ts` (zod-validated), never
  `process.env.X` directly in route handlers — see `security.md`.
- All database access goes through the singleton in `lib/db.ts`, never a new
  `PrismaClient()` per request (exhausts connections under serverless).
- API route handlers that accept a body validate it with `zod` before doing
  anything with it.
- Anything that mutates state or handles auth is rate-limited via
  `lib/rate-limit.ts`.

## Naming

Folders and files use the conventions `create-next-app` itself uses
(kebab-case routes, PascalCase components) — the scaffold does not invent a
competing convention on top of Next.js defaults.

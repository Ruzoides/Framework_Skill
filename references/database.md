# Database

## Why Prisma over Drizzle

Both are solid choices. This scaffold uses **Prisma** because:

- Schema-first (`schema.prisma`) is easier to read at a glance than a
  TypeScript-defined schema when you're jumping between many
  differently-shaped generated projects.
- `prisma migrate dev` / `prisma migrate deploy` is a complete, turnkey
  migration workflow out of the box.
- The generated client and its documentation/tutorial coverage is the widest
  available for a Postgres + Next.js stack, which matters for a scaffold
  meant to be picked up and modified by hand afterward.

Drizzle is lighter and edge-native, which is the right tradeoff for
latency-sensitive edge functions — if a generated project later needs that,
swapping the data layer is a contained change since all access goes through
`lib/db.ts`.

## Version pin

`init-site.sh` installs `prisma@^6` / `@prisma/client@^6` explicitly, not
`@latest`. Prisma 7 removed `url`/`directUrl` from the `datasource` block in
`schema.prisma` in favor of driver adapters configured in a separate
`prisma.config.ts`, which would change how `lib/db.ts` constructs the
client too. Prisma 6 is still fully supported and keeps the schema/client
wiring in this scaffold simple; revisit this pin if/when the ecosystem
(tutorials, adapters, this doc) has caught up to Prisma 7.

## Connection pooling (serverless)

Prisma opens a connection per invocation. Under Vercel's serverless
functions, many concurrent invocations can exhaust Postgres's connection
limit fast. The generated `.env.example` documents two `DATABASE_URL`
patterns:

- **Neon** (or another pooling-aware provider): use the pooled connection
  string it provides directly.
- **Any other Postgres**: put PgBouncer (or Prisma Accelerate) in front of it,
  and use the pooled connection string for the app, with a separate
  non-pooled `DIRECT_URL` for running migrations (Prisma's
  `directUrl` schema field).

`prisma/schema.prisma` in the template includes both `url` and `directUrl` on
the `datasource` block so this is wired from the start, not an
afterthought.

## Migrations

- Local development: `npx prisma migrate dev` — creates and applies a
  migration, regenerates the client.
- CI / production deploy: `npx prisma migrate deploy` — applies pending
  migrations only, never generates new ones. `setup-deploy.sh` wires this
  into the Vercel build step (`vercel.json` build command) so migrations run
  automatically before the new deployment goes live.

## Seeding

`prisma/seed.ts` (generated when the project is created) seeds a single
placeholder record so `verify-site.sh` and local development have something
to look at; delete or replace it once real data exists.

## Common pitfalls

- Instantiating `new PrismaClient()` inside a route handler instead of
  importing the singleton from `lib/db.ts` — leaks connections under load.
- Running `prisma migrate dev` against a production database — always use
  `migrate deploy` outside of local development.
- Forgetting `directUrl` when pooling is in front of the database — migrations
  will fail or hang because pooled connections often don't support the
  session-level features migrations need.

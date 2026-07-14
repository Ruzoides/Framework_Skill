#!/usr/bin/env bash
# Scaffolds a brand-new hardened Next.js + Postgres project: landing page,
# admin dashboard, auth, (optionally) payments and email, security hardening,
# CI, and deployment config. See SKILL.md for the full workflow this fits
# into, and references/*.md for the reasoning behind each piece.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

usage() {
  cat >&2 <<'EOF'
Usage: init-site.sh <project-name> [--auth=clerk|authjs] [--payments=yes|no]
                     [--email=yes|no] [--ratelimit=upstash|memory]

Defaults: --auth=clerk --payments=yes --email=yes --ratelimit=upstash
EOF
  exit 1
}

PROJECT_NAME="${1:-}"; [ -n "$PROJECT_NAME" ] || usage
shift || true

AUTH_PROVIDER="clerk"
PAYMENTS="yes"
EMAIL="yes"
RATELIMIT="upstash"

for arg in "$@"; do
  case "$arg" in
    --auth=*) AUTH_PROVIDER="${arg#*=}" ;;
    --payments=*) PAYMENTS="${arg#*=}" ;;
    --email=*) EMAIL="${arg#*=}" ;;
    --ratelimit=*) RATELIMIT="${arg#*=}" ;;
    *) fail "unknown argument: $arg" ;;
  esac
done

check_prereqs

PROJECT_DIR="$(pwd)/$PROJECT_NAME"
[ -e "$PROJECT_DIR" ] && fail "target already exists: $PROJECT_DIR"

log_step "Creating Next.js project: $PROJECT_NAME"
npx --yes create-next-app@latest "$PROJECT_NAME" \
  --typescript --tailwind --eslint --app --empty \
  --import-alias "@/*" --use-npm --yes

cd "$PROJECT_DIR"

log_step "Copying landing page and admin dashboard shell"
rm -f "$PROJECT_DIR/app/page.tsx"
mkdir -p "$PROJECT_DIR/app/(marketing)" "$PROJECT_DIR/app/(admin)/dashboard" "$PROJECT_DIR/app/api/health"
copy_template "app/(marketing)/layout.tsx" "$PROJECT_DIR/app/(marketing)/layout.tsx"
copy_template "app/(marketing)/page.tsx" "$PROJECT_DIR/app/(marketing)/page.tsx"
copy_template "app/(admin)/dashboard/page.tsx" "$PROJECT_DIR/app/(admin)/dashboard/page.tsx"
copy_template "app/api/health/route.ts" "$PROJECT_DIR/app/api/health/route.ts"

log_step "Setting up Prisma + Postgres"
# Pinned to the Prisma 6 line: Prisma 7 removed datasource url/directUrl from
# schema.prisma in favor of driver adapters configured in prisma.config.ts,
# which would require a different schema/client wiring throughout this
# scaffold. Prisma 6 is still fully supported and is what references/database.md
# documents.
add_npm_dev_dep "$PROJECT_DIR" "prisma@^6"
add_npm_dev_dep "$PROJECT_DIR" tsx
add_npm_dep "$PROJECT_DIR" "@prisma/client@^6"
add_npm_dep "$PROJECT_DIR" zod
mkdir -p "$PROJECT_DIR/prisma"
copy_template "prisma/schema.base.prisma" "$PROJECT_DIR/prisma/schema.prisma"
copy_template "prisma/seed.ts" "$PROJECT_DIR/prisma/seed.ts"
copy_template "lib/db.ts" "$PROJECT_DIR/lib/db.ts"
copy_template "lib/env.ts" "$PROJECT_DIR/lib/env.ts"
( cd "$PROJECT_DIR" && npm pkg set prisma.seed="tsx prisma/seed.ts" )
ensure_env_example_var "$PROJECT_DIR" "DATABASE_URL" "pooled Postgres connection string (see references/database.md)"
ensure_env_example_var "$PROJECT_DIR" "DIRECT_URL" "direct (non-pooled) Postgres connection string, used for migrations"

log_step "Setting up authentication ($AUTH_PROVIDER)"
"$SCRIPT_DIR/postinstall/setup-auth.sh" "$PROJECT_DIR" --auth="$AUTH_PROVIDER"

if [ "$PAYMENTS" = "yes" ]; then
  log_step "Setting up payments (Stripe)"
  "$SCRIPT_DIR/postinstall/setup-payments.sh" "$PROJECT_DIR"
fi

if [ "$EMAIL" = "yes" ]; then
  log_step "Setting up email (Resend)"
  "$SCRIPT_DIR/postinstall/setup-email.sh" "$PROJECT_DIR"
fi

log_step "Applying security hardening"
"$SCRIPT_DIR/postinstall/setup-security.sh" "$PROJECT_DIR" --ratelimit="$RATELIMIT"

log_step "Setting up CI"
"$SCRIPT_DIR/postinstall/setup-ci.sh" "$PROJECT_DIR"

log_step "Setting up deployment config"
"$SCRIPT_DIR/postinstall/setup-deploy.sh" "$PROJECT_DIR"

log_step "Generating Prisma client"
( cd "$PROJECT_DIR" && npx prisma generate )

# create-next-app's initial build cache (.next/types) still points at the
# default app/page.tsx we just deleted — clear it so the next build/dev
# only sees the current route tree.
rm -rf "$PROJECT_DIR/.next"

log_step "Done"
{
  echo
  echo "Project created at: $PROJECT_DIR"
  echo
  echo "Manual steps still needed:"
  echo "  - Create a Postgres database (e.g. Neon) and set DATABASE_URL / DIRECT_URL in .env"
  if [ "$AUTH_PROVIDER" = "clerk" ]; then
    echo "  - Create a Clerk application and set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY"
  else
    echo "  - Run 'npx auth secret' and set AUTH_SECRET"
  fi
  if [ "$PAYMENTS" = "yes" ]; then
    echo "  - Create a Stripe account and set STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  fi
  if [ "$EMAIL" = "yes" ]; then
    echo "  - Create a Resend account, verify a sending domain, and set RESEND_API_KEY"
  fi
  if [ "$RATELIMIT" = "upstash" ]; then
    echo "  - Create an Upstash Redis database and set UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN"
  fi
  echo "  - Create a Vercel project and link this repo for deployment"
  echo
  echo "Run scripts/verify-site.sh $PROJECT_DIR to confirm everything builds and runs."
} >&2

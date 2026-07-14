#!/usr/bin/env bash
# Installs Stripe checkout + subscriptions + a signature-verified webhook
# handler. Detects which auth provider is already installed so the checkout
# route can identify the current user correctly.
set -euo pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$LIB_DIR/lib/common.sh"

usage() { echo "Usage: setup-payments.sh <project-dir>" >&2; exit 1; }

PROJECT_DIR="${1:-}"; [ -n "$PROJECT_DIR" ] || usage
[ -d "$PROJECT_DIR" ] || fail "project directory not found: $PROJECT_DIR"

log_step "Setting up payments (Stripe) in $PROJECT_DIR"

if file_contains "$PROJECT_DIR/package.json" '"@clerk/nextjs"'; then
  AUTH_PROVIDER="clerk"
elif file_contains "$PROJECT_DIR/package.json" '"next-auth"'; then
  AUTH_PROVIDER="authjs"
else
  fail "no supported auth provider detected in $PROJECT_DIR — run setup-auth.sh first"
fi

if ! file_contains "$PROJECT_DIR/package.json" '"stripe"'; then
  add_npm_dep "$PROJECT_DIR" stripe
fi

if [ ! -f "$PROJECT_DIR/lib/rate-limit.ts" ]; then
  copy_template "lib/rate-limit.memory.ts" "$PROJECT_DIR/lib/rate-limit.ts"
fi

copy_template "lib/stripe.ts" "$PROJECT_DIR/lib/stripe.ts"
copy_template "lib/pricing-data.ts" "$PROJECT_DIR/lib/pricing-data.ts"
copy_template "app/api/checkout/route.$AUTH_PROVIDER.ts" "$PROJECT_DIR/app/api/checkout/route.ts"
copy_template "app/api/webhooks/stripe/route.ts" "$PROJECT_DIR/app/api/webhooks/stripe/route.ts"
mkdir -p "$PROJECT_DIR/app/(marketing)/pricing"
copy_template "app/(marketing)/pricing/page.tsx" "$PROJECT_DIR/app/(marketing)/pricing/page.tsx"

if [ -f "$PROJECT_DIR/prisma/schema.prisma" ] && ! file_contains "$PROJECT_DIR/prisma/schema.prisma" "model Subscription"; then
  insert_before_marker "$PROJECT_DIR/prisma/schema.prisma" "framework-skill:user-relations" \
    '  subscription Subscription?'
  append_template "prisma/subscription.prisma" "$PROJECT_DIR/prisma/schema.prisma"
fi

ensure_env_example_var "$PROJECT_DIR" "NEXT_PUBLIC_APP_URL" "e.g. http://localhost:3000 in dev, your production URL after deploy"
ensure_env_example_var "$PROJECT_DIR" "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "Stripe dashboard -> Developers -> API keys"
ensure_env_example_var "$PROJECT_DIR" "STRIPE_SECRET_KEY" "Stripe dashboard -> Developers -> API keys (test mode key while developing)"
ensure_env_example_var "$PROJECT_DIR" "STRIPE_WEBHOOK_SECRET" "Stripe dashboard -> Developers -> Webhooks -> signing secret"

insert_before_marker "$PROJECT_DIR/lib/env.ts" "framework-skill:build-time-vars" \
  '  NEXT_PUBLIC_APP_URL: z.string().url(),'
insert_before_marker "$PROJECT_DIR/lib/env.ts" "framework-skill:build-time-vars" \
  '  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),'
insert_before_marker "$PROJECT_DIR/lib/env.ts" "framework-skill:runtime-vars" \
  '  STRIPE_SECRET_KEY: z.string().min(1),'
insert_before_marker "$PROJECT_DIR/lib/env.ts" "framework-skill:runtime-vars" \
  '  STRIPE_WEBHOOK_SECRET: z.string().min(1),'

log_info "Stripe installed ($AUTH_PROVIDER checkout route). Replace the placeholder price ID in the pricing page, set the Stripe env vars, and point a Stripe webhook at /api/webhooks/stripe (see references/payments.md)."

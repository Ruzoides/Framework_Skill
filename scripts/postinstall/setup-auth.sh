#!/usr/bin/env bash
# Installs and wires authentication into a Next.js project — Clerk or
# Auth.js/NextAuth. Safe to run standalone against an existing project
# ("add auth to my site") as well as from init-site.sh.
set -euo pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$LIB_DIR/lib/common.sh"

usage() { echo "Usage: setup-auth.sh <project-dir> [--auth=clerk|authjs]" >&2; exit 1; }

PROJECT_DIR="${1:-}"; [ -n "$PROJECT_DIR" ] || usage
shift || true

AUTH_PROVIDER="clerk"
for arg in "$@"; do
  case "$arg" in
    --auth=*) AUTH_PROVIDER="${arg#*=}" ;;
    *) fail "unknown argument: $arg" ;;
  esac
done

[ -d "$PROJECT_DIR" ] || fail "project directory not found: $PROJECT_DIR"

# Every auth provider's generated code needs a rate limiter to exist at
# lib/rate-limit.ts. If setup-security.sh hasn't run yet, bootstrap the
# in-memory version now; setup-security.sh will replace it later if a
# different backend is requested.
if [ ! -f "$PROJECT_DIR/lib/rate-limit.ts" ]; then
  copy_template "lib/rate-limit.memory.ts" "$PROJECT_DIR/lib/rate-limit.ts"
fi

case "$AUTH_PROVIDER" in
  clerk)
    log_step "Setting up Clerk authentication in $PROJECT_DIR"

    if ! file_contains "$PROJECT_DIR/package.json" '"@clerk/nextjs"'; then
      add_npm_dep "$PROJECT_DIR" "@clerk/nextjs"
    else
      log_warn "@clerk/nextjs already installed, skipping"
    fi

    copy_template "middleware.clerk.ts" "$PROJECT_DIR/middleware.ts"
    copy_template "app/layout.clerk.tsx" "$PROJECT_DIR/app/layout.tsx"
    mkdir -p "$PROJECT_DIR/app/(admin)/dashboard"
    copy_template "app/(admin)/layout.clerk.tsx" "$PROJECT_DIR/app/(admin)/layout.tsx"
    copy_template "app/sign-in/[[...sign-in]]/page.tsx" "$PROJECT_DIR/app/sign-in/[[...sign-in]]/page.tsx"
    copy_template "app/sign-up/[[...sign-up]]/page.tsx" "$PROJECT_DIR/app/sign-up/[[...sign-up]]/page.tsx"

    ensure_env_example_var "$PROJECT_DIR" "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "Clerk dashboard -> API Keys"
    ensure_env_example_var "$PROJECT_DIR" "CLERK_SECRET_KEY" "Clerk dashboard -> API Keys"
    insert_before_marker "$PROJECT_DIR/lib/env.ts" "framework-skill:build-time-vars" \
      '  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),'
    insert_before_marker "$PROJECT_DIR/lib/env.ts" "framework-skill:build-time-vars" \
      '  CLERK_SECRET_KEY: z.string().min(1),'

    if [ -f "$PROJECT_DIR/prisma/schema.prisma" ] && ! file_contains "$PROJECT_DIR/prisma/schema.prisma" "model User"; then
      append_template "prisma/user.clerk.prisma" "$PROJECT_DIR/prisma/schema.prisma"
    fi

    log_info "Clerk installed. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY, and sync users to the local User table via a Clerk webhook (see references/auth.md)."
    ;;

  authjs)
    log_step "Setting up Auth.js (NextAuth) in $PROJECT_DIR"

    for pkg in next-auth@beta @auth/prisma-adapter bcryptjs; do
      if ! file_contains "$PROJECT_DIR/package.json" "\"${pkg%@*}\""; then
        add_npm_dep "$PROJECT_DIR" "$pkg"
      fi
    done
    add_npm_dev_dep "$PROJECT_DIR" "@types/bcryptjs"

    copy_template "auth.authjs.ts" "$PROJECT_DIR/auth.ts"
    copy_template "middleware.authjs.ts" "$PROJECT_DIR/middleware.ts"
    copy_template "app/layout.authjs.tsx" "$PROJECT_DIR/app/layout.tsx"
    mkdir -p "$PROJECT_DIR/app/(admin)/dashboard"
    copy_template "app/(admin)/layout.authjs.tsx" "$PROJECT_DIR/app/(admin)/layout.tsx"
    copy_template "app/api/auth/[...nextauth]/route.ts" "$PROJECT_DIR/app/api/auth/[...nextauth]/route.ts"
    copy_template "app/api/register/route.ts" "$PROJECT_DIR/app/api/register/route.ts"
    copy_template "app/sign-up/page.authjs.tsx" "$PROJECT_DIR/app/sign-up/page.tsx"

    ensure_env_example_var "$PROJECT_DIR" "AUTH_SECRET" "generate with: npx auth secret"
    insert_before_marker "$PROJECT_DIR/lib/env.ts" "framework-skill:build-time-vars" \
      '  AUTH_SECRET: z.string().min(1),'

    if [ -f "$PROJECT_DIR/prisma/schema.prisma" ] && ! file_contains "$PROJECT_DIR/prisma/schema.prisma" "model User"; then
      append_template "prisma/user.authjs.prisma" "$PROJECT_DIR/prisma/schema.prisma"
    fi

    log_info "Auth.js installed with a Credentials provider (email + bcrypt password hash). Run 'npx auth secret' and set AUTH_SECRET (see references/auth.md)."
    ;;

  *)
    fail "unknown auth provider: $AUTH_PROVIDER (expected clerk or authjs)"
    ;;
esac

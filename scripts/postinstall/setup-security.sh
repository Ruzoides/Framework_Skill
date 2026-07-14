#!/usr/bin/env bash
# Applies security hardening across whatever has been generated so far:
# security headers in middleware.ts, a real rate-limit backend, and an
# origin check on hand-written mutating Route Handlers.
set -euo pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$LIB_DIR/lib/common.sh"

usage() { echo "Usage: setup-security.sh <project-dir> [--ratelimit=upstash|memory]" >&2; exit 1; }

PROJECT_DIR="${1:-}"; [ -n "$PROJECT_DIR" ] || usage
shift || true

RATELIMIT="upstash"
for arg in "$@"; do
  case "$arg" in
    --ratelimit=*) RATELIMIT="${arg#*=}" ;;
    *) fail "unknown argument: $arg" ;;
  esac
done

[ -d "$PROJECT_DIR" ] || fail "project directory not found: $PROJECT_DIR"

log_step "Applying security hardening to $PROJECT_DIR (rate-limit backend: $RATELIMIT)"

# --- Security headers in middleware.ts -------------------------------------
if [ -f "$PROJECT_DIR/middleware.ts" ]; then
  insert_template_before_marker "$PROJECT_DIR/middleware.ts" \
    "framework-skill:security-headers" "snippets/security-headers.ts"
else
  log_warn "no middleware.ts found — run setup-auth.sh first for route protection + security headers"
fi

# --- Rate-limit backend ------------------------------------------------------
case "$RATELIMIT" in
  upstash)
    copy_template "lib/rate-limit.upstash.ts" "$PROJECT_DIR/lib/rate-limit.ts"
    if ! file_contains "$PROJECT_DIR/package.json" '"@upstash/ratelimit"'; then
      add_npm_dep "$PROJECT_DIR" "@upstash/ratelimit"
    fi
    if ! file_contains "$PROJECT_DIR/package.json" '"@upstash/redis"'; then
      add_npm_dep "$PROJECT_DIR" "@upstash/redis"
    fi
    ensure_env_example_var "$PROJECT_DIR" "UPSTASH_REDIS_REST_URL" "Upstash console -> Redis database -> REST API"
    ensure_env_example_var "$PROJECT_DIR" "UPSTASH_REDIS_REST_TOKEN" "Upstash console -> Redis database -> REST API"
    insert_before_marker "$PROJECT_DIR/lib/env.ts" "framework-skill:runtime-vars" \
      '  UPSTASH_REDIS_REST_URL: z.string().url(),'
    insert_before_marker "$PROJECT_DIR/lib/env.ts" "framework-skill:runtime-vars" \
      '  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),'
    ;;
  memory)
    copy_template "lib/rate-limit.memory.ts" "$PROJECT_DIR/lib/rate-limit.ts"
    log_warn "in-memory rate limiting does not hold a global limit across multiple serverless instances — fine for local dev only"
    ;;
  *)
    fail "unknown ratelimit backend: $RATELIMIT (expected upstash or memory)"
    ;;
esac

# --- Origin check on hand-written mutating routes ---------------------------
for route in \
  "app/api/checkout/route.ts" \
  "app/api/register/route.ts" \
  "app/api/reset-password/request/route.ts" \
  "app/api/reset-password/confirm/route.ts"
do
  file="$PROJECT_DIR/$route"
  [ -f "$file" ] || continue
  copy_template "lib/csrf.ts" "$PROJECT_DIR/lib/csrf.ts"
  insert_template_before_marker "$file" "framework-skill:imports" "snippets/csrf-import.ts"
  insert_template_before_marker "$file" "framework-skill:csrf-check" "snippets/csrf-check.ts"
done

log_info "Security headers, rate limiting ($RATELIMIT), and origin checks applied. See references/security.md for the full checklist and CSP customization notes."

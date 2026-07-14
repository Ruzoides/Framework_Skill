#!/usr/bin/env bash
# Post-scaffold smoke test: proves a generated project actually installs,
# migrates, lints, typechecks, builds, and serves the landing page while
# redirecting unauthenticated visitors away from the admin dashboard — not
# just that it typechecks. Fails loudly on the first broken step.
set -euo pipefail

usage() { echo "Usage: verify-site.sh <project-dir>" >&2; exit 1; }
PROJECT_DIR="${1:-}"; [ -n "$PROJECT_DIR" ] || usage
[ -d "$PROJECT_DIR" ] || { echo "[verify] project directory not found: $PROJECT_DIR" >&2; exit 1; }

log() { echo "[verify] $*" >&2; }

cd "$PROJECT_DIR"

DOCKER_DB_STARTED=0
DEV_PID=""

cleanup() {
  if [ -n "$DEV_PID" ]; then
    kill "$DEV_PID" >/dev/null 2>&1 || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
  if [ "$DOCKER_DB_STARTED" = "1" ]; then
    docker rm -f framework-skill-verify-db >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

log "npm install"
npm install

log "prisma generate"
npx prisma generate

if [ -z "${DATABASE_URL:-}" ] && ! grep -q '^DATABASE_URL=.\+' .env 2>/dev/null; then
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    log "no DATABASE_URL configured — starting a throwaway local Postgres via docker"
    docker rm -f framework-skill-verify-db >/dev/null 2>&1 || true
    docker run -d --name framework-skill-verify-db \
      -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=app \
      -p 55432:5432 postgres:16-alpine >/dev/null
    DOCKER_DB_STARTED=1
    export DATABASE_URL="postgresql://postgres:postgres@localhost:55432/app"
    export DIRECT_URL="$DATABASE_URL"
    for _ in $(seq 1 30); do
      docker exec framework-skill-verify-db pg_isready -U postgres >/dev/null 2>&1 && break
      sleep 1
    done
  else
    log "no DATABASE_URL set and no usable docker found."
    log "Set DATABASE_URL (and DIRECT_URL) in .env or the environment, then re-run this script."
    exit 1
  fi
fi

if [ ! -d prisma/migrations ]; then
  log "no migrations yet — creating the initial migration (prisma migrate dev --name init)"
  npx prisma migrate dev --name init
else
  log "prisma migrate deploy"
  npx prisma migrate deploy
fi

# A freshly created-then-deleted app/page.tsx (this scaffold replaces it with
# route groups) can leave create-next-app's initial .next/types cache
# pointing at a file that no longer exists — clear it so typecheck/build see
# only the current route tree.
rm -rf .next

log "lint"
npm run lint

log "typecheck"
npx tsc --noEmit

log "build"
npm run build

log "starting dev server on :4173"
npm run dev -- -p 4173 >/tmp/framework-skill-verify-dev.log 2>&1 &
DEV_PID=$!

READY=0
for _ in $(seq 1 30); do
  if curl -sf -o /dev/null http://localhost:4173/; then READY=1; break; fi
  sleep 1
done
[ "$READY" = "1" ] || { log "dev server never became reachable — see /tmp/framework-skill-verify-dev.log"; exit 1; }

LANDING_CODE="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4173/)"
[ "$LANDING_CODE" = "200" ] || { log "landing page returned $LANDING_CODE, expected 200"; exit 1; }
log "landing page OK (200)"

HEALTH_CODE="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4173/api/health)"
[ "$HEALTH_CODE" = "200" ] || { log "health check returned $HEALTH_CODE, expected 200"; exit 1; }
log "health check OK (200)"

ADMIN_CODE="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4173/dashboard)"
case "$ADMIN_CODE" in
  302|303|307)
    log "admin route redirects unauthenticated visitors ($ADMIN_CODE) — protected as expected"
    ;;
  200)
    log "admin route returned 200 without auth — it is NOT protected. Check middleware.ts."
    exit 1
    ;;
  *)
    log "admin route returned unexpected $ADMIN_CODE"
    exit 1
    ;;
esac

log "all checks passed"

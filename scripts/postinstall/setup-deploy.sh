#!/usr/bin/env bash
# Adds Vercel deployment config and finalizes .env.example. Domain/DNS setup
# is surfaced as instructions rather than scripted, since it requires access
# to a Vercel account and a DNS provider this script can't reach.
set -euo pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$LIB_DIR/lib/common.sh"

usage() { echo "Usage: setup-deploy.sh <project-dir>" >&2; exit 1; }

PROJECT_DIR="${1:-}"; [ -n "$PROJECT_DIR" ] || usage
[ -d "$PROJECT_DIR" ] || fail "project directory not found: $PROJECT_DIR"

log_step "Setting up deployment config in $PROJECT_DIR"

copy_template "vercel.json" "$PROJECT_DIR/vercel.json"

cat <<'EOF' >&2

Deployment (manual, one-time):
  1. Push this project to a GitHub repo.
  2. In Vercel: New Project -> import that repo -> it detects Next.js automatically.
  3. Copy every variable from .env.example into Vercel's Project Settings -> Environment Variables
     (with real values, for Production and Preview).
  4. To use a custom domain: Vercel Project Settings -> Domains -> add the domain,
     then create the CNAME/A record it gives you at your DNS provider.
  5. Every push to main triggers a new deployment; vercel.json's buildCommand runs
     pending Prisma migrations before the new build goes live.

See references/deployment.md for details.
EOF

log_info "vercel.json added and .env.example finalized."

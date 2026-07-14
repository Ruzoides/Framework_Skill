#!/usr/bin/env bash
# Wires GitHub Actions CI: lint/typecheck/test, npm audit, gitleaks, CodeQL,
# and Dependabot.
set -euo pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$LIB_DIR/lib/common.sh"

usage() { echo "Usage: setup-ci.sh <project-dir>" >&2; exit 1; }

PROJECT_DIR="${1:-}"; [ -n "$PROJECT_DIR" ] || usage
[ -d "$PROJECT_DIR" ] || fail "project directory not found: $PROJECT_DIR"

log_step "Setting up CI in $PROJECT_DIR"

mkdir -p "$PROJECT_DIR/.github/workflows"
copy_template ".github/workflows/ci.yml.template" "$PROJECT_DIR/.github/workflows/ci.yml"
copy_template ".github/workflows/codeql.yml.template" "$PROJECT_DIR/.github/workflows/codeql.yml"
copy_template ".github/dependabot.yml" "$PROJECT_DIR/.github/dependabot.yml"
copy_template ".gitleaks.toml" "$PROJECT_DIR/.gitleaks.toml"

log_info "CI added: lint/typecheck/test + npm audit + gitleaks (ci.yml), CodeQL (codeql.yml), Dependabot. Enable gitleaks-action and CodeQL in the repo's Actions settings if this is a private repo on a plan that requires it."

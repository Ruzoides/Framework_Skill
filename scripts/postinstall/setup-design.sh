#!/usr/bin/env bash
# Installs the design system foundation: color/type tokens, fonts, and a
# vendored shadcn/ui component set. Components are copied in as owned source
# (assets/templates/components/ui/*), not fetched live from ui.shadcn.com at
# scaffold time — shadcn's own philosophy is "you own this code," and
# vendoring means this works offline and isn't a dependency on a live
# registry being reachable. See references/design.md.
set -euo pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$LIB_DIR/lib/common.sh"

usage() { echo "Usage: setup-design.sh <project-dir>" >&2; exit 1; }

PROJECT_DIR="${1:-}"; [ -n "$PROJECT_DIR" ] || usage
[ -d "$PROJECT_DIR" ] || fail "project directory not found: $PROJECT_DIR"

log_step "Setting up design system (tokens, fonts, shadcn/ui components) in $PROJECT_DIR"

# shadcn/ui's own runtime dependencies for the vendored components.
add_npm_dep "$PROJECT_DIR" "radix-ui"
add_npm_dep "$PROJECT_DIR" "class-variance-authority"
add_npm_dep "$PROJECT_DIR" "clsx"
add_npm_dep "$PROJECT_DIR" "tailwind-merge"
add_npm_dep "$PROJECT_DIR" "lucide-react"
add_npm_dep "$PROJECT_DIR" "tw-animate-css"

copy_template "lib/utils.ts" "$PROJECT_DIR/lib/utils.ts"

mkdir -p "$PROJECT_DIR/components/ui"
if [ -d "$PROJECT_DIR/components/ui" ] && [ -n "$(ls -A "$PROJECT_DIR/components/ui" 2>/dev/null)" ]; then
  log_warn "components/ui already has files — leaving existing components alone, only adding missing ones"
  for f in "$TEMPLATES_DIR"/components/ui/*.tsx; do
    name="$(basename "$f")"
    [ -f "$PROJECT_DIR/components/ui/$name" ] || cp "$f" "$PROJECT_DIR/components/ui/$name"
  done
else
  rmdir "$PROJECT_DIR/components/ui" 2>/dev/null || true
  copy_template "components/ui" "$PROJECT_DIR/components/ui"
fi

mkdir -p "$PROJECT_DIR/components"
copy_template "components/numeric-text.tsx" "$PROJECT_DIR/components/numeric-text.tsx"

# Overwrite create-next-app's bare-bones globals.css with our design tokens.
# This must run after the components above are in place but is otherwise
# order-independent — it fully replaces the file, no merge needed.
copy_template "app/globals.css" "$PROJECT_DIR/app/globals.css"

log_info "Design system installed: color/type tokens in app/globals.css, fonts wired in app/layout.tsx, shadcn/ui components in components/ui/. See references/design.md to reskin for a real brand."

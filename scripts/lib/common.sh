#!/usr/bin/env bash
# Shared helpers for scripts/init-site.sh and scripts/postinstall/*.sh.
# Source this file; do not execute it directly.

set -euo pipefail

SCRIPT_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$(cd "$SCRIPT_LIB_DIR/../../assets/templates" && pwd)"

log_info()  { echo "[info]  $*" >&2; }
log_warn()  { echo "[warn]  $*" >&2; }
log_error() { echo "[error] $*" >&2; }
log_step()  { echo; echo "==> $*" >&2; }

fail() {
  log_error "$*"
  exit 1
}

require_cmd() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || fail "required command not found: $cmd"
}

check_prereqs() {
  require_cmd node
  require_cmd npm
  require_cmd npx

  local node_major
  node_major="$(node -p 'process.versions.node.split(".")[0]')"
  if [ "$node_major" -lt 18 ]; then
    fail "Node.js 18+ is required, found $(node -v)"
  fi

  if ! command -v docker >/dev/null 2>&1; then
    log_warn "docker not found — local throwaway Postgres won't be available; set DATABASE_URL to a reachable database"
  fi
}

# is_next_project <dir>
# True if <dir> already looks like a Next.js App Router project.
is_next_project() {
  local dir="$1"
  [ -f "$dir/package.json" ] && { [ -f "$dir/next.config.js" ] || [ -f "$dir/next.config.ts" ] || [ -f "$dir/next.config.mjs" ]; }
}

# copy_template <relative-path-under-assets/templates> <dest-dir>
copy_template() {
  local rel="$1" dest="$2"
  local src="$TEMPLATES_DIR/$rel"
  [ -e "$src" ] || fail "template not found: $rel"
  mkdir -p "$(dirname "$dest")"
  cp -R "$src" "$dest"
}

# file_contains <file> <needle>
file_contains() {
  local file="$1" needle="$2"
  [ -f "$file" ] && grep -qF "$needle" "$file"
}

# ensure_env_example_var <project-dir> <VAR_NAME> [comment]
# Appends VAR_NAME= to .env.example if not already present. Idempotent so
# postinstall scripts can be run standalone against an existing project.
ensure_env_example_var() {
  local dir="$1" var="$2" comment="${3:-}"
  local envfile="$dir/.env.example"
  touch "$envfile"
  if ! grep -q "^${var}=" "$envfile" 2>/dev/null; then
    [ -n "$comment" ] && echo "# $comment" >> "$envfile"
    echo "${var}=" >> "$envfile"
  fi
}

# append_template <relative-path-under-assets/templates> <dest-file>
# Appends a template's contents to an existing file (e.g. adding a Prisma
# model to schema.prisma).
append_template() {
  local rel="$1" dest="$2"
  local src="$TEMPLATES_DIR/$rel"
  [ -e "$src" ] || fail "template not found: $rel"
  [ -f "$dest" ] || fail "cannot append to missing file: $dest"
  echo >> "$dest"
  cat "$src" >> "$dest"
}

# insert_before_marker <file> <marker-comment-text> <line-to-insert>
# Inserts <line-to-insert> immediately before the first line containing
# <marker-comment-text>. Used to extend generated files (lib/env.ts,
# middleware.ts, prisma models) at well-known extension points. No-op if
# <line-to-insert> is already present (idempotent for reruns).
insert_before_marker() {
  local file="$1" marker="$2" line="$3"
  [ -f "$file" ] || fail "cannot edit missing file: $file"
  file_contains "$file" "$line" && return 0
  local tmp
  tmp="$(mktemp)"
  awk -v marker="$marker" -v newline="$line" '
    index($0, marker) { print newline }
    { print }
  ' "$file" > "$tmp"
  mv "$tmp" "$file"
}

# insert_template_before_marker <file> <marker-comment-text> <template-rel-path>
# Like insert_before_marker but inserts the (possibly multi-line) contents of
# a template file instead of a single line. Idempotent: skipped if the
# snippet's first line is already present in <file>.
insert_template_before_marker() {
  local file="$1" marker="$2" template_rel="$3"
  local src="$TEMPLATES_DIR/$template_rel"
  [ -e "$src" ] || fail "template not found: $template_rel"
  [ -f "$file" ] || fail "cannot edit missing file: $file"
  local first_line
  first_line="$(head -n1 "$src")"
  file_contains "$file" "$first_line" && return 0
  local tmp
  tmp="$(mktemp)"
  awk -v marker="$marker" -v snippet="$src" '
    index($0, marker) {
      while ((getline line < snippet) > 0) print line
      close(snippet)
    }
    { print }
  ' "$file" > "$tmp"
  mv "$tmp" "$file"
}

# merge_json_deps <project-dir> <dep-name> <version>
# Adds a dependency to package.json via npm (kept as a wrapper so callers
# don't need to remember the --save flag convention in one place).
add_npm_dep() {
  local dir="$1" pkg="$2"
  ( cd "$dir" && npm install --save "$pkg" )
}

add_npm_dev_dep() {
  local dir="$1" pkg="$2"
  ( cd "$dir" && npm install --save-dev "$pkg" )
}

#!/usr/bin/env bash
# Installs Resend + welcome/reset-password/receipt email templates and wires
# them to the right triggers for whichever auth provider is installed.
set -euo pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$LIB_DIR/lib/common.sh"

usage() { echo "Usage: setup-email.sh <project-dir>" >&2; exit 1; }

PROJECT_DIR="${1:-}"; [ -n "$PROJECT_DIR" ] || usage
[ -d "$PROJECT_DIR" ] || fail "project directory not found: $PROJECT_DIR"

log_step "Setting up email (Resend) in $PROJECT_DIR"

if file_contains "$PROJECT_DIR/package.json" '"@clerk/nextjs"'; then
  AUTH_PROVIDER="clerk"
elif file_contains "$PROJECT_DIR/package.json" '"next-auth"'; then
  AUTH_PROVIDER="authjs"
else
  fail "no supported auth provider detected in $PROJECT_DIR — run setup-auth.sh first"
fi

if ! file_contains "$PROJECT_DIR/package.json" '"resend"'; then
  add_npm_dep "$PROJECT_DIR" resend
fi

mkdir -p "$PROJECT_DIR/emails"
copy_template "lib/email.ts" "$PROJECT_DIR/lib/email.ts"
copy_template "emails/welcome.tsx" "$PROJECT_DIR/emails/welcome.tsx"
copy_template "emails/reset-password.tsx" "$PROJECT_DIR/emails/reset-password.tsx"
copy_template "emails/receipt.tsx" "$PROJECT_DIR/emails/receipt.tsx"

ensure_env_example_var "$PROJECT_DIR" "RESEND_API_KEY" "Resend dashboard -> API Keys"
ensure_env_example_var "$PROJECT_DIR" "EMAIL_FROM" "verified sender, e.g. noreply@yourdomain.com (falls back to Resend's sandbox sender)"
insert_before_marker "$PROJECT_DIR/lib/env.ts" "framework-skill:runtime-vars" \
  '  RESEND_API_KEY: z.string().min(1),'

# Receipt email on an active/trialing Stripe subscription — same for either
# auth provider, since it only depends on the Subscription/User tables.
if [ -f "$PROJECT_DIR/app/api/webhooks/stripe/route.ts" ]; then
  insert_template_before_marker "$PROJECT_DIR/app/api/webhooks/stripe/route.ts" \
    "framework-skill:imports" "snippets/webhook-import-email.ts"
  insert_template_before_marker "$PROJECT_DIR/app/api/webhooks/stripe/route.ts" \
    "framework-skill:on-subscription-event" "snippets/webhook-send-receipt.ts"
fi

case "$AUTH_PROVIDER" in
  clerk)
    # Clerk owns sign-up/sign-in and its own password reset UI — the only
    # email hook needed is "welcome" on first user.created webhook event.
    copy_template "app/api/webhooks/clerk/route.ts" "$PROJECT_DIR/app/api/webhooks/clerk/route.ts"
    if ! file_contains "$PROJECT_DIR/package.json" '"svix"'; then
      add_npm_dep "$PROJECT_DIR" svix
    fi
    ensure_env_example_var "$PROJECT_DIR" "CLERK_WEBHOOK_SECRET" "Clerk dashboard -> Webhooks -> signing secret (endpoint: /api/webhooks/clerk)"
    insert_before_marker "$PROJECT_DIR/lib/env.ts" "framework-skill:runtime-vars" \
      '  CLERK_WEBHOOK_SECRET: z.string().min(1),'
    log_info "Point a Clerk webhook (user.created) at /api/webhooks/clerk to trigger the welcome email."
    ;;

  authjs)
    # Auth.js: welcome email on our own /api/register route, plus a full
    # forgot/reset-password flow (Auth.js's Credentials provider doesn't
    # include one out of the box).
    if [ -f "$PROJECT_DIR/app/api/register/route.ts" ]; then
      insert_template_before_marker "$PROJECT_DIR/app/api/register/route.ts" \
        "framework-skill:imports" "snippets/register-import-email.ts"
      insert_template_before_marker "$PROJECT_DIR/app/api/register/route.ts" \
        "framework-skill:on-register" "snippets/register-send-welcome.ts"
    fi

    mkdir -p "$PROJECT_DIR/app/forgot-password" "$PROJECT_DIR/app/reset-password"
    copy_template "app/forgot-password/page.tsx" "$PROJECT_DIR/app/forgot-password/page.tsx"
    copy_template "app/reset-password/page.tsx" "$PROJECT_DIR/app/reset-password/page.tsx"
    copy_template "app/reset-password/reset-password-form.tsx" "$PROJECT_DIR/app/reset-password/reset-password-form.tsx"
    mkdir -p "$PROJECT_DIR/app/api/reset-password/request" "$PROJECT_DIR/app/api/reset-password/confirm"
    copy_template "app/api/reset-password/request/route.ts" "$PROJECT_DIR/app/api/reset-password/request/route.ts"
    copy_template "app/api/reset-password/confirm/route.ts" "$PROJECT_DIR/app/api/reset-password/confirm/route.ts"

    log_info "Forgot/reset-password flow added at /forgot-password and /reset-password."
    ;;
esac

log_info "Resend installed. Set RESEND_API_KEY (and verify a sending domain before going to production — see references/email.md)."

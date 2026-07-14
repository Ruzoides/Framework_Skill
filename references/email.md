# Email (Resend)

Added by `scripts/postinstall/setup-email.sh`, called automatically from
`init-site.sh` unless `--email=no`. Templates live in `emails/` as plain
React components (no extra templating library) rendered by Resend's
`react:` option; `lib/email.ts` wraps the Resend client and exposes
`sendWelcomeEmail`, `sendResetPasswordEmail`, `sendReceiptEmail`.

## Triggers

| Email | Trigger | Provider-specific? |
|---|---|---|
| Welcome | Clerk: `user.created` webhook (`/api/webhooks/clerk`, svix-verified). Auth.js: after `/api/register` creates the user. | Yes — inserted per auth provider |
| Password reset | Auth.js only, from `/api/reset-password/request` | Auth.js only (Clerk has its own hosted reset flow) |
| Receipt | Stripe webhook, when a subscription becomes `active`/`trialing` | No — same for either auth provider |

## Setup

1. Resend dashboard → **API Keys**: set `RESEND_API_KEY`.
2. Before sending real mail, verify a sending domain (Resend dashboard →
   Domains → add SPF/DKIM/DMARC records at your DNS provider) and set
   `EMAIL_FROM` to an address on that domain. Until then, mail sends from
   Resend's shared sandbox sender (`onboarding@resend.dev`), which is fine
   for development but not for production — deliverability without a
   verified domain is unreliable and some providers will spam-filter it.
3. Clerk projects additionally need `CLERK_WEBHOOK_SECRET` (see `auth.md`)
   for the welcome-email webhook to verify correctly.

## Common pitfalls

- Sending from an unverified domain in production — expect spam-folder
  delivery or outright rejection.
- Letting an email failure break the triggering request — every call site
  in this scaffold does `.catch(() => {})` on the send so a Resend outage
  doesn't turn into a failed signup or a failed payment.
- Putting secrets or PII directly in email subject lines — subjects are
  often logged/indexed by mail providers more casually than bodies.

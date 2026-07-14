# Payments (Stripe)

Added by `scripts/postinstall/setup-payments.sh`, called automatically from
`init-site.sh` unless `--payments=no`.

## Flow

1. `app/(marketing)/pricing/page.tsx` — client page listing plans (replace
   the placeholder `price_replace_me` IDs with real Stripe Price IDs from
   your dashboard's product catalog).
2. `POST /api/checkout` (`route.clerk.ts` or `route.authjs.ts`, whichever
   matches the installed auth provider) — creates (or reuses) a Stripe
   Customer and a local `Subscription` row, then creates a Stripe Checkout
   Session in `subscription` mode and returns its URL.
3. `POST /api/webhooks/stripe` — Stripe calls this on subscription
   lifecycle events. The handler verifies the payload with
   `stripe.webhooks.constructEvent()` using the raw request body (never
   `req.json()` first — that would destroy the exact bytes the signature
   was computed over) and upserts the local `Subscription` row's status,
   price, and period end.

## Why the checkout route never trusts a client-supplied amount

The client only ever sends a Stripe **Price ID**. The actual amount charged
is whatever that Price ID resolves to inside Stripe, looked up server-side —
the amount is never taken from the request body. This is the single most
common way payment integrations get exploited (a modified request claiming
a $1 charge for a $100 product), and it's closed by construction here, not
by an extra check that could be forgotten.

## Setup

1. Stripe dashboard (test mode) → **Developers → API keys**: set
   `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Create a Product + Price in the dashboard, put the Price ID into the
   pricing page.
3. **Developers → Webhooks**: add an endpoint at
   `https://<your-domain>/api/webhooks/stripe` (or use the Stripe CLI's
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for
   local development), subscribed to at least
   `customer.subscription.created/updated/deleted`. Copy the signing secret
   into `STRIPE_WEBHOOK_SECRET`.
4. Set `NEXT_PUBLIC_APP_URL` (used for the checkout success/cancel
   redirect URLs).

## Common pitfalls

- Calling `req.json()` before the webhook signature check — this alters the
  bytes Stripe signed, so `constructEvent` will always throw.
- Trusting `checkout.session.completed` alone — subscriptions can change
  status afterward (past-due, canceled) independent of the initial
  checkout; this scaffold listens to the `customer.subscription.*` events
  directly instead so the local status always reflects the current truth.
- Using the same webhook signing secret across test and live mode — Stripe
  issues a distinct secret per webhook endpoint per mode.

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getRuntimeEnv } from "@/lib/env";
import { db } from "@/lib/db";
// framework-skill:imports

// Stripe requires the *raw* request body to verify the signature — do not
// call req.json() before this. constructEvent() throws on any tampering or
// mismatched secret, which is what makes this endpoint trustworthy despite
// being publicly reachable.
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const { STRIPE_WEBHOOK_SECRET } = getRuntimeEnv();

  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      // Billing period now lives per subscription item (a subscription can
      // carry multiple prices), not on the subscription itself.
      const item = sub.items.data[0];
      const priceId = item?.price.id;
      const periodEnd = item?.current_period_end;

      await db.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          status: sub.status,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      });

      // framework-skill:on-subscription-event
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

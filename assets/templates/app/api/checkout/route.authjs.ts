import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { apiRateLimit } from "@/lib/rate-limit";
// framework-skill:imports

// Client sends only a Stripe Price ID — never a raw amount. The price (and
// therefore the amount actually charged) is always looked up server-side
// from Stripe by that ID.
const bodySchema = z.object({ priceId: z.string().min(1) });

export async function POST(req: Request) {
  // framework-skill:csrf-check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { success } = await apiRateLimit.limit(session.user.id);
  if (!success) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const stripe = getStripe();
  let subscription = await db.subscription.findUnique({ where: { userId: session.user.id } });

  if (!subscription) {
    const customer = await stripe.customers.create({ email: session.user.email ?? undefined });
    subscription = await db.subscription.create({
      data: { userId: session.user.id, stripeCustomerId: customer.id, status: "incomplete" },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: subscription.stripeCustomerId,
    line_items: [{ price: parsed.data.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}

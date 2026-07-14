import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
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
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { success } = await apiRateLimit.limit(userId);
  if (!success) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  let dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) {
    dbUser = await db.user.create({
      data: { clerkId: userId, email: email ?? `${userId}@placeholder.invalid` },
    });
  }

  const stripe = getStripe();
  let subscription = await db.subscription.findUnique({ where: { userId: dbUser.id } });

  if (!subscription) {
    const customer = await stripe.customers.create({ email });
    subscription = await db.subscription.create({
      data: { userId: dbUser.id, stripeCustomerId: customer.id, status: "incomplete" },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: subscription.stripeCustomerId,
    line_items: [{ price: parsed.data.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}

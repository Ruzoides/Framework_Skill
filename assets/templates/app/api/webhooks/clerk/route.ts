import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getRuntimeEnv } from "@/lib/env";
import { sendWelcomeEmail } from "@/lib/email";

// Clerk signs webhook payloads with Svix. Verifying here is what makes it
// safe to trust event.data despite this endpoint being publicly reachable.
export async function POST(req: Request) {
  const { CLERK_WEBHOOK_SECRET } = getRuntimeEnv();
  const payload = await req.text();
  const headerList = await headers();

  const svixHeaders = {
    "svix-id": headerList.get("svix-id") ?? "",
    "svix-timestamp": headerList.get("svix-timestamp") ?? "",
    "svix-signature": headerList.get("svix-signature") ?? "",
  };

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = new Webhook(CLERK_WEBHOOK_SECRET).verify(payload, svixHeaders) as typeof event;
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const id = event.data.id as string;
    const emailAddresses = event.data.email_addresses as { email_address: string }[] | undefined;
    const email = emailAddresses?.[0]?.email_address;
    if (email) {
      await db.user.upsert({
        where: { clerkId: id },
        create: { clerkId: id, email },
        update: { email },
      });
      await sendWelcomeEmail(email).catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}

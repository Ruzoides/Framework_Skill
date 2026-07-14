import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { authRateLimit } from "@/lib/rate-limit";
import { sendResetPasswordEmail } from "@/lib/email";
// framework-skill:imports

const bodySchema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  // framework-skill:csrf-check
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await authRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  // Always respond ok — never reveal whether the email is registered.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: {
        identifier: parsed.data.email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(parsed.data.email)}`;
    await sendResetPasswordEmail(parsed.data.email, resetUrl).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

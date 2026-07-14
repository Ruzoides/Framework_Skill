import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authRateLimit } from "@/lib/rate-limit";
// framework-skill:imports

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

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

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    // Don't reveal whether the email is already registered.
    return NextResponse.json({ ok: true });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.user.create({
    data: { email: parsed.data.email, name: parsed.data.name, passwordHash },
  });

  // framework-skill:on-register

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
// framework-skill:imports

const bodySchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  // framework-skill:csrf-check
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const record = await db.verificationToken.findUnique({
    where: {
      identifier_token: { identifier: parsed.data.email, token: parsed.data.token },
    },
  });
  if (!record || record.expires < new Date()) {
    return NextResponse.json({ error: "invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.user.update({ where: { email: parsed.data.email }, data: { passwordHash } });
  await db.verificationToken.delete({
    where: { identifier_token: { identifier: parsed.data.email, token: parsed.data.token } },
  });

  return NextResponse.json({ ok: true });
}

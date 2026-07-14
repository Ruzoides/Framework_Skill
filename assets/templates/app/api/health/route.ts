import { NextResponse } from "next/server";

// Unauthenticated liveness check — used by deployment platforms and by
// scripts/verify-site.sh. Do not add anything here that requires secrets or
// touches the database; keep it cheap and always-available.
export async function GET() {
  return NextResponse.json({ status: "ok" });
}

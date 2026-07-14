import { NextResponse } from "next/server";

// Defense-in-depth for hand-written, state-changing Route Handlers: reject
// cross-origin requests that carry an Origin header pointing somewhere
// other than this app. Same-origin fetch() calls from your own pages always
// send Origin, so this blocks a third-party page from driving these
// endpoints via the visitor's browser session. (Server Actions get an
// equivalent check from Next.js automatically — this is only for routes
// under app/api.)
export function checkOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get("origin");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (origin && appUrl && origin !== appUrl) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  return null;
}

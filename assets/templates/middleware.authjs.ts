import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PROTECTED_PREFIX = "/dashboard";

export default auth((req) => {
  const isProtected = req.nextUrl.pathname.startsWith(PROTECTED_PREFIX);
  if (isProtected && !req.auth) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  const res = NextResponse.next();
  // framework-skill:security-headers
  return res;
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

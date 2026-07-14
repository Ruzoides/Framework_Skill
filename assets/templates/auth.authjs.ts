import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authRateLimit } from "@/lib/rate-limit";

// Auth.js v5 root config. Credentials provider is the default here for a
// self-hosted, no-third-party-vendor option; swap in an OAuth provider
// (Google, GitHub, ...) as needed — see references/auth.md.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  // No `pages.signIn` override — that option is for pointing Auth.js at a
  // *custom* sign-in page. Setting it to the built-in route's own path
  // makes Auth.js treat the default page as a custom redirect target and
  // loop redirecting to itself. Omitting it keeps the built-in page.
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        const { success } = await authRateLimit.limit(ip);
        if (!success) {
          throw new Error("Too many sign-in attempts. Try again later.");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});

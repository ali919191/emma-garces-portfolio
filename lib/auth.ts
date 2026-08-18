import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { redirect } from "next/navigation";

export function adminEmails() {
  return (process.env.ADMIN_EMAIL ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  return Boolean(email && adminEmails().includes(email.toLowerCase()));
}

export const authOptions: NextAuthOptions = {
  providers: [GitHubProvider({ clientId: process.env.AUTH_GITHUB_ID ?? "", clientSecret: process.env.AUTH_GITHUB_SECRET ?? "" })],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/auth/signin", error: "/auth/signin" },
  callbacks: {
    async signIn({ user }) { return isAdminEmail(user.email); },
    async session({ session }) {
      if (!isAdminEmail(session.user?.email)) return { ...session, user: undefined } as Session;
      return session;
    },
  },
};

export async function getAdminSession() {
  if (process.env.NODE_ENV !== "production" && process.env.AUTH_BYPASS_FOR_LOCAL_TESTS === "true") {
    return { user: { name: "Local QA Admin", email: adminEmails()[0] ?? "admin@example.test" }, expires: new Date(Date.now() + 3_600_000).toISOString() } satisfies Session;
  }
  const session = await getServerSession(authOptions);
  return isAdminEmail(session?.user?.email) ? session : null;
}

export async function requireAdminPage(callbackUrl: string) {
  const session = await getAdminSession();
  if (!session) redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session;
}

export async function requireAdminApi() {
  return Boolean(await getAdminSession());
}

"use client";

import { signIn } from "next-auth/react";

export function SignInButton({ callbackUrl }: { callbackUrl: string }) {
  return <button className="button studio-signin-button" onClick={() => signIn("github", { callbackUrl })}>Continue with GitHub</button>;
}

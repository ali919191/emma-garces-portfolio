import { SignInButton } from "./SignInButton";
import Link from "next/link";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.startsWith("/") ? params.callbackUrl : "/studio";
  return (
    <main className="studio-signin">
      <div className="studio-signin-mark">EG<span>.</span></div>
      <p>Private Portfolio Studio</p>
      <h1>Welcome back,<br /><em>Emma.</em></h1>
      <span>Sign in with the GitHub account whose email matches the administrator allowlist.</span>
      {params.error && <div className="signin-error">This account is not authorized for the Portfolio Studio.</div>}
      <SignInButton callbackUrl={callbackUrl} />
      <Link href="/">Return to public portfolio</Link>
    </main>
  );
}

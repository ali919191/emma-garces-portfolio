import type { Metadata } from "next";
import Link from "next/link";
import { BookingForm } from "../components/BookingForm";
import { HarftAttribution } from "../components/HarftAttribution";
import { siteUrl } from "../../lib/portfolio";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const url = siteUrl();
  const title = "Book Emma Garces — Modeling Inquiries";
  const description = "Request Emma Garces for runway, editorial, commercial, photography, and brand partnership bookings.";
  return {
    title,
    description,
    alternates: { canonical: "/book" },
    openGraph: { title, description, url: `${url}/book`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function BookPage() {
  return (
    <main className="platform-page">
      <header className="platform-top">
        <Link className="wordmark" href="/" aria-label="Emma Garces home">EG<span>.</span></Link>
        <Link href="/">Portfolio</Link>
      </header>
      <section className="platform-intro">
        <p>Bookings</p>
        <h1>Book Emma</h1>
        <span>Share the essentials. Emma reviews every inquiry personally through Portfolio Studio.</span>
      </section>
      <BookingForm />
      <HarftAttribution tone="light" />
    </main>
  );
}

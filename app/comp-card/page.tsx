import type { Metadata } from "next";
import { readPortfolio } from "../../db/portfolio-repository";
import { siteUrl, toPublicPortfolio } from "../../lib/portfolio";
import { CompCardExperience } from "./CompCardExperience";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const url = siteUrl();
  const title = "Emma Garces — Digital Comp Card";
  const description = "Measurements, selected images, and booking details for international runway model Emma Garces.";
  return {
    title,
    description,
    alternates: { canonical: "/comp-card" },
    openGraph: { title, description, url: `${url}/comp-card`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CompCardPage() {
  return <CompCardExperience data={toPublicPortfolio(await readPortfolio())} />;
}

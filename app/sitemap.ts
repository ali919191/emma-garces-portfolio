import { readPortfolio } from "../db/portfolio-repository";
import { creditsWithShowPages, siteUrl, toPublicPortfolio } from "../lib/portfolio";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const url = siteUrl();
  const base = [
    { url, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${url}/book`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${url}/comp-card`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
  ];
  // Show pages only exist for credits that actually resolve to media or footage,
  // so the sitemap can never advertise a URL that 404s.
  try {
    const data = toPublicPortfolio(await readPortfolio());
    return [
      ...base,
      ...creditsWithShowPages(data).map((credit) => ({
        url: `${url}/shows/${credit.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return base;
  }
}

import { siteUrl } from "../lib/portfolio";

export default function sitemap() {
  const url = siteUrl();
  return [
    { url, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${url}/book`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${url}/comp-card`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
  ];
}

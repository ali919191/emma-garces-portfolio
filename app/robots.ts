import { siteUrl } from "../lib/portfolio";

export default function robots() {
  const url = siteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/studio", "/exports", "/auth", "/api"] },
    ],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}

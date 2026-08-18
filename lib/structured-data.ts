import { instagramHandle, publicAssetSrc, siteUrl, type MediaAsset, type PortfolioData } from "./portfolio";

function absoluteAssetUrl(site: string, asset?: MediaAsset) {
  if (!asset) return undefined;
  const path = publicAssetSrc(asset);
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${site}${path}`;
}

export function publicStructuredData(data: PortfolioData) {
  const url = siteUrl();
  const name = data.profile.professionalName || data.profile.fullName || "Emma Garces";
  const imageAsset = data.media.find((asset) => asset.id === data.settings.heroMediaId)
    ?? data.media.find((asset) => asset.featured);
  const image = absoluteAssetUrl(url, imageAsset) ?? `${url}${process.env.SOCIAL_IMAGE_PATH ?? "/og.png"}`;
  const sameAs = [data.profile.instagram, data.profile.tiktok, data.profile.website].filter(Boolean);
  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": `${url}/#person`,
    name,
    url,
    jobTitle: "International Runway Model",
    description: data.profile.bio || "The official portfolio of international runway model Emma Garces.",
    image,
  };
  if (sameAs.length) person.sameAs = sameAs;
  if (data.profile.city || data.profile.country) {
    person.homeLocation = {
      "@type": "Place",
      name: [data.profile.city, data.profile.country].filter(Boolean).join(", "),
    };
  }
  if (data.profile.instagram) person.identifier = instagramHandle(data.profile.instagram);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: "Emma Garces",
        description: "Official modeling portfolio and booking presence for Emma Garces.",
        inLanguage: "en",
        publisher: { "@id": `${url}/#person` },
      },
      person,
    ],
  };
}

import { isValidMediaKey } from "./media-access";

export type VisibilityKey =
  | "age"
  | "location"
  | "email"
  | "phone"
  | "instagram"
  | "tiktok"
  | "website"
  | "agency"
  | "measurements"
  | "languages"
  | "availability";

export type AvailabilityStatus = "available" | "limited" | "unavailable";

export type PortfolioSettings = {
  heroMediaId: string;
  publicSite: boolean;
  baseLine: string;
  selectedServices: string[];
  lastPublishedAt: string;
  availabilityStatus: AvailabilityStatus;
  primaryMarket: string;
  travelAvailable: boolean;
  additionalMarkets: string;
  availabilityNote: string;
  compCardPrimaryMediaId: string;
  compCardMediaIds: string[];
};

export type Profile = {
  fullName: string;
  professionalName: string;
  age: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  instagram: string;
  tiktok: string;
  website: string;
  agency: string;
  bookingContact: string;
  bio: string;
  height: string;
  bust: string;
  waist: string;
  hips: string;
  dressSize: string;
  shoeSize: string;
  hair: string;
  eyes: string;
  ethnicity: string;
  languages: string;
  citizenship: string;
  travelAvailability: string;
  workAuthorization: string;
  visibility: Record<VisibilityKey, boolean>;
};

export type Credit = {
  id: string;
  event: string;
  designer: string;
  showName: string;
  city: string;
  country: string;
  year: string;
  venue: string;
  notes: string;
  designerBase: string;
  priority: "featured" | "standard" | "hidden";
  verified: boolean;
  public: boolean;
};

export type MediaCategory =
  | "runway"
  | "editorial"
  | "beauty"
  | "digitals"
  | "headshot"
  | "full-body"
  | "campaign"
  | "lookbook"
  | "behind-the-scenes";

export type MediaAsset = {
  id: string;
  key: string;
  url: string;
  filename: string;
  mimeType?: string;
  size?: number;
  category: MediaCategory;
  caption: string;
  photographer: string;
  designer: string;
  event: string;
  date: string;
  featured: boolean;
  public: boolean;
  focalPoint: "center" | "top" | "bottom";
};

export type Video = {
  id: string;
  url: string;
  label: string;
  designer: string;
  year: string;
  primary: boolean;
  public: boolean;
};

export type PortfolioData = {
  profile: Profile;
  credits: Credit[];
  media: MediaAsset[];
  videos: Video[];
  settings: PortfolioSettings;
};

export const serviceOptions = [
  "International Runway",
  "Fashion Week",
  "Designer Shows",
  "Editorial",
  "Campaigns",
  "Lookbooks",
  "Fashion Events",
  "Commercial Modeling",
];

export const emptyProfile: Profile = {
  fullName: "Emma Garces",
  professionalName: "Emma Garces",
  age: "22",
  city: "",
  country: "",
  email: "",
  phone: "",
  instagram: "https://www.instagram.com/_emmagarces_",
  tiktok: "",
  website: "",
  agency: "",
  bookingContact: "",
  bio: "",
  height: "",
  bust: "",
  waist: "",
  hips: "",
  dressSize: "",
  shoeSize: "",
  hair: "",
  eyes: "",
  ethnicity: "",
  languages: "",
  citizenship: "",
  travelAvailability: "",
  workAuthorization: "",
  visibility: {
    age: false,
    location: false,
    email: false,
    phone: false,
    instagram: true,
    tiktok: false,
    website: false,
    agency: false,
    measurements: false,
    languages: false,
    availability: true,
  },
};

export const defaultPortfolio: PortfolioData = {
  profile: emptyProfile,
  credits: [],
  media: [],
  videos: [],
  settings: {
    heroMediaId: "",
    publicSite: true,
    baseLine: "USA Based | Available Internationally",
    selectedServices: ["International Runway", "Fashion Week", "Designer Shows", "Editorial", "Campaigns", "Lookbooks"],
    lastPublishedAt: "",
    availabilityStatus: "available",
    primaryMarket: "",
    travelAvailable: true,
    additionalMarkets: "",
    availabilityNote: "",
    compCardPrimaryMediaId: "",
    compCardMediaIds: [],
  },
};

export const availabilityLabels: Record<AvailabilityStatus, string> = {
  available: "Available for bookings",
  limited: "Limited availability",
  unavailable: "Currently unavailable",
};

export function siteUrl() {
  return (process.env.SITE_URL ?? "https://www.emmagarces.com").replace(/\/$/, "");
}

export function normalizeSettings(settings: Partial<PortfolioSettings> & Pick<PortfolioSettings, "heroMediaId" | "publicSite" | "selectedServices">): PortfolioSettings {
  const ids = Array.isArray(settings.compCardMediaIds) ? settings.compCardMediaIds.filter((id): id is string => typeof id === "string" && Boolean(id)).slice(0, 8) : [];
  const status = settings.availabilityStatus;
  return {
    heroMediaId: settings.heroMediaId,
    publicSite: settings.publicSite,
    baseLine: settings.baseLine ?? "",
    selectedServices: settings.selectedServices,
    lastPublishedAt: settings.lastPublishedAt ?? "",
    availabilityStatus: status === "limited" || status === "unavailable" ? status : "available",
    primaryMarket: settings.primaryMarket ?? "",
    travelAvailable: settings.travelAvailable !== false,
    additionalMarkets: settings.additionalMarkets ?? "",
    availabilityNote: settings.availabilityNote ?? "",
    compCardPrimaryMediaId: settings.compCardPrimaryMediaId ?? "",
    compCardMediaIds: ids,
  };
}

export function selectCompCardAssets(media: MediaAsset[], settings: PortfolioSettings) {
  const byId = new Map(media.map((asset) => [asset.id, asset]));
  const primary = byId.get(settings.compCardPrimaryMediaId) ?? byId.get(settings.heroMediaId) ?? media.find((asset) => asset.featured) ?? media[0];
  const chosen = (settings.compCardMediaIds.length ? settings.compCardMediaIds : media.filter((asset) => asset.featured).map((asset) => asset.id))
    .map((id) => byId.get(id))
    .filter((asset): asset is MediaAsset => asset != null && asset.id !== primary?.id)
    .slice(0, 8);
  return { primary, supporting: chosen };
}

export function mediaUrl(key: string) {
  if (!isValidMediaKey(key)) return "";
  return `/api/media?key=${encodeURIComponent(key)}`;
}

export function publicAssetSrc(asset: Pick<MediaAsset, "key" | "url">) {
  return mediaUrl(asset.key) || asset.url;
}

export function nextHeroMediaId(currentHeroId: string, assetId: string) {
  return currentHeroId === assetId ? "" : assetId;
}

export function toPublicPortfolio(data: PortfolioData): PortfolioData {
  const publicMedia = data.media.filter((asset) => asset.public);
  const visibility = data.profile.visibility;
  const profile: Profile = {
    ...data.profile,
    age: visibility.age ? data.profile.age : "",
    city: visibility.location ? data.profile.city : "",
    country: visibility.location ? data.profile.country : "",
    email: visibility.email ? data.profile.email : "",
    phone: visibility.phone ? data.profile.phone : "",
    instagram: visibility.instagram ? data.profile.instagram : "",
    tiktok: visibility.tiktok ? data.profile.tiktok : "",
    website: visibility.website ? data.profile.website : "",
    agency: visibility.agency ? data.profile.agency : "",
    bookingContact: "",
    height: visibility.measurements ? data.profile.height : "",
    bust: visibility.measurements ? data.profile.bust : "",
    waist: visibility.measurements ? data.profile.waist : "",
    hips: visibility.measurements ? data.profile.hips : "",
    dressSize: visibility.measurements ? data.profile.dressSize : "",
    shoeSize: visibility.measurements ? data.profile.shoeSize : "",
    hair: visibility.measurements ? data.profile.hair : "",
    eyes: visibility.measurements ? data.profile.eyes : "",
    ethnicity: "",
    languages: visibility.languages ? data.profile.languages : "",
    citizenship: "",
    travelAvailability: visibility.availability ? data.profile.travelAvailability : "",
    workAuthorization: "",
  };
  const publicHero = publicMedia.some((asset) => asset.id === data.settings.heroMediaId)
    ? data.settings.heroMediaId
    : publicMedia.find((asset) => asset.featured)?.id ?? "";
  const settings = normalizeSettings(data.settings);
  const publicIds = new Set(publicMedia.map((asset) => asset.id));
  return {
    profile,
    credits: data.credits
      .filter((credit) => credit.public && credit.priority !== "hidden")
      .map((credit) => ({ ...credit, venue: "", notes: "", designerBase: "" })),
    media: publicMedia.map((asset) => ({ ...asset, url: "" })),
    videos: data.videos.filter((video) => video.public),
    settings: {
      ...settings,
      heroMediaId: publicHero,
      compCardPrimaryMediaId: publicIds.has(settings.compCardPrimaryMediaId) ? settings.compCardPrimaryMediaId : "",
      compCardMediaIds: settings.compCardMediaIds.filter((id) => publicIds.has(id)),
    },
  };
}

export function isPortfolioData(value: unknown): value is PortfolioData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PortfolioData>;
  return Boolean(
    candidate.profile &&
    typeof candidate.profile === "object" &&
    typeof candidate.profile.fullName === "string" &&
    typeof candidate.profile.professionalName === "string" &&
    candidate.profile.visibility &&
    typeof candidate.profile.visibility === "object" &&
    candidate.settings &&
    typeof candidate.settings === "object" &&
    typeof candidate.settings.heroMediaId === "string" &&
    typeof candidate.settings.publicSite === "boolean" &&
    Array.isArray(candidate.settings.selectedServices) &&
    Array.isArray(candidate.credits) &&
    candidate.credits.every((credit) => Boolean(credit && typeof credit.id === "string" && typeof credit.public === "boolean")) &&
    Array.isArray(candidate.media) &&
    candidate.media.every((asset) => Boolean(asset && typeof asset.id === "string" && typeof asset.key === "string" && typeof asset.public === "boolean")) &&
    Array.isArray(candidate.videos),
  );
}

export function instagramHandle(url: string) {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return parts[0] ? `@${parts[0]}` : "Instagram";
  } catch {
    return url || "Instagram";
  }
}

export function isValidUrl(value: string) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function portfolioWarnings(data: PortfolioData) {
  const warnings: string[] = [];
  if (!data.profile.fullName.trim()) warnings.push("Add a full or professional name.");
  if (!data.settings.heroMediaId) warnings.push("Your portfolio is missing a primary hero image.");
  if (!data.profile.email && !data.profile.bookingContact && !data.profile.instagram) warnings.push("Add at least one booking contact method.");
  if (!data.profile.email) warnings.push("Your comp card has no booking email.");
  if (!data.credits.length) warnings.push("No runway credits have been entered yet.");
  if (data.credits.some((credit) => /new york fashion week|nyfw/i.test(credit.event) && (!credit.designer || !credit.showName))) {
    warnings.push("NYFW is listed as a credit, but a designer or show name is missing.");
  }
  const urls = [data.profile.instagram, data.profile.tiktok, data.profile.website, ...data.videos.map((video) => video.url)];
  if (urls.some((url) => !isValidUrl(url))) warnings.push("One or more social or video links are invalid.");
  const seen = new Set<string>();
  if (data.credits.some((credit) => {
    const key = `${credit.event}|${credit.designer}|${credit.year}`.toLowerCase();
    if (!credit.event && !credit.designer) return false;
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  })) warnings.push("Possible duplicate runway credits found.");
  if (!data.media.some((asset) => asset.category === "runway" && asset.featured)) warnings.push("Your Dubai Submission is missing a primary runway image.");
  return warnings;
}

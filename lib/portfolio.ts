export type VisibilityKey =
  | "age"
  | "location"
  | "email"
  | "phone"
  | "instagram"
  | "agency"
  | "measurements"
  | "languages"
  | "availability";

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
  settings: {
    heroMediaId: string;
    publicSite: boolean;
    baseLine: string;
    selectedServices: string[];
    lastPublishedAt: string;
  };
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
  },
};

export function mediaUrl(key: string) {
  return `/api/media?key=${encodeURIComponent(key)}`;
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

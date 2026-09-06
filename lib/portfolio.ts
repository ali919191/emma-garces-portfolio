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

/**
 * Where a `cover` crop should anchor. Only the surfaces that crop deliberately —
 * the hero and the comp card — consult it; galleries render at the image's own
 * aspect ratio and never need it.
 */
export type FocalPoint = "center" | "top" | "bottom" | "left" | "right";

export const focalPoints: FocalPoint[] = ["center", "top", "bottom", "left", "right"];

/** `focal_point` is a free text column, so an unknown value must not reach CSS. */
export function normalizeFocalPoint(value: unknown): FocalPoint {
  return focalPoints.includes(value as FocalPoint) ? (value as FocalPoint) : "center";
}

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
  focalPoint: FocalPoint;
  /**
   * Marks material captured while Emma was a minor. Classification only — it never
   * publishes or unpublishes anything on its own. See `minorEraPolicy`.
   */
  minorEra: boolean;
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

/**
 * Controlled vocabulary for discrete, machine-readable facts inside a story section.
 * Kept deliberately small: one flat fact list with a `kind` discriminator beats ten
 * parallel arrays for maintainability, and later phases can filter by `kind`.
 */
export type StoryFactKind =
  | "milestone"
  | "designer"
  | "show"
  | "location"
  | "education"
  | "business"
  | "technology"
  | "award"
  | "goal"
  | "note";

export const storyFactKinds: StoryFactKind[] = [
  "milestone",
  "designer",
  "show",
  "location",
  "education",
  "business",
  "technology",
  "award",
  "goal",
  "note",
];

export type StoryFact = {
  id: string;
  kind: StoryFactKind;
  label: string;
  value: string;
  year: string;
  location: string;
};

/**
 * A headline career figure rendered in the public experience strip.
 * Additive JSONB — no migration required.
 */
export type StoryStat = {
  id: string;
  value: string;
  label: string;
};

/**
 * The JSONB payload stored in `content_sections.content`.
 * `mediaIds` / `videoIds` / `creditIds` are lightweight references to the canonical
 * records in `media_assets`, `portfolio_videos` and `runway_credits`. Referencing a
 * record never copies it and never overrides its own visibility.
 */
export type StorySectionContent = {
  summary: string;
  body: string;
  facts: StoryFact[];
  stats: StoryStat[];
  mediaIds: string[];
  videoIds: string[];
  creditIds: string[];
};

export type StorySection = {
  slug: string;
  title: string;
  content: StorySectionContent;
  public: boolean;
  sortOrder: number;
};

export type PortfolioData = {
  profile: Profile;
  credits: Credit[];
  media: MediaAsset[];
  videos: Video[];
  settings: PortfolioSettings;
  story: StorySection[];
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
  story: [],
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

/**
 * Canonical story sections. These slugs match the rows seeded into `content_sections`
 * by `seedPortfolio()`; the titles match the titles that seed derives from each slug,
 * so re-saving never churns an existing row. Studio renders this catalog so the editor
 * works whether or not the production database was ever seeded.
 */
export const storySectionCatalog: { slug: string; title: string }[] = [
  { slug: "about-emma", title: "About Emma" },
  { slug: "modeling-journey", title: "Modeling Journey" },
  { slug: "selected-archive", title: "Selected Archive" },
  { slug: "selected-runway", title: "Selected Runway" },
  { slug: "fashion-weeks", title: "Fashion Weeks" },
  { slug: "designers", title: "Designers" },
  { slug: "editorial", title: "Editorial" },
  { slug: "campaigns", title: "Campaigns" },
  { slug: "beauty", title: "Beauty" },
  { slug: "dubai", title: "Dubai" },
  { slug: "international-availability", title: "International Availability" },
  // Added in the owner-authorized Phase 3 scope. Additive: content_sections is keyed by
  // slug and rows are created on save, so no migration and no seed re-run is required.
  { slug: "beyond-the-runway", title: "Beyond The Runway" },
  { slug: "professional-approach", title: "Professional Approach" },
];

export const emptyStoryContent: StorySectionContent = {
  summary: "",
  body: "",
  facts: [],
  stats: [],
  mediaIds: [],
  videoIds: [],
  creditIds: [],
};

function stringList(value: unknown, limit = 200): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item === "string" && item && !seen.has(item)) seen.add(item);
    if (seen.size >= limit) break;
  }
  return [...seen];
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeStoryFact(value: unknown, index = 0): StoryFact {
  const fact = (value ?? {}) as Partial<StoryFact>;
  const kind = storyFactKinds.includes(fact.kind as StoryFactKind) ? (fact.kind as StoryFactKind) : "note";
  return {
    id: typeof fact.id === "string" && fact.id ? fact.id : `fact-${index}`,
    kind,
    label: text(fact.label),
    value: text(fact.value),
    year: text(fact.year),
    location: text(fact.location),
  };
}

export function normalizeStoryStat(value: unknown, index = 0): StoryStat {
  const stat = (value ?? {}) as Partial<StoryStat>;
  return {
    id: typeof stat.id === "string" && stat.id ? stat.id : `stat-${index}`,
    value: text(stat.value),
    label: text(stat.label),
  };
}

/** Coerces whatever is in JSONB into a predictable shape. Never invents content. */
export function normalizeStoryContent(value: unknown): StorySectionContent {
  const content = (value ?? {}) as Partial<StorySectionContent>;
  return {
    summary: text(content.summary),
    body: text(content.body),
    facts: Array.isArray(content.facts) ? content.facts.slice(0, 200).map(normalizeStoryFact) : [],
    stats: Array.isArray(content.stats) ? content.stats.slice(0, 8).map(normalizeStoryStat) : [],
    mediaIds: stringList(content.mediaIds),
    videoIds: stringList(content.videoIds),
    creditIds: stringList(content.creditIds),
  };
}

export function normalizeStorySection(value: unknown, index = 0): StorySection {
  const section = (value ?? {}) as Partial<StorySection>;
  const slug = typeof section.slug === "string" && section.slug ? section.slug : `section-${index}`;
  return {
    slug,
    title: text(section.title) || storySectionCatalog.find((entry) => entry.slug === slug)?.title || slug,
    content: normalizeStoryContent(section.content),
    public: section.public === true,
    sortOrder: typeof section.sortOrder === "number" && Number.isFinite(section.sortOrder) ? section.sortOrder : index,
  };
}

export function normalizeStory(value: unknown): StorySection[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .map((section, index) => normalizeStorySection(section, index))
    .filter((section) => (seen.has(section.slug) ? false : seen.add(section.slug) !== undefined))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Presentation helper: returns every canonical section, backed by stored rows where they
 * exist and blank placeholders where they do not, followed by any non-catalog sections
 * already present in the database. Used by Studio so the editor never depends on seed state.
 */
export function mergeStoryCatalog(sections: StorySection[]): StorySection[] {
  const stored = new Map(normalizeStory(sections).map((section) => [section.slug, section]));
  const merged = storySectionCatalog.map((entry, index) => {
    const existing = stored.get(entry.slug);
    stored.delete(entry.slug);
    return existing
      ? { ...existing, title: existing.title || entry.title, sortOrder: index }
      : { slug: entry.slug, title: entry.title, content: structuredClone(emptyStoryContent), public: false, sortOrder: index };
  });
  return [...merged, ...[...stored.values()].map((section, index) => ({ ...section, sortOrder: merged.length + index }))];
}

/**
 * Public read helpers. These operate on an already-sanitized `PortfolioData` — i.e. the
 * output of `toPublicPortfolio()` on public routes — so they can never surface a private
 * section or a private media/video/credit reference.
 */
export function findStorySection(story: StorySection[], slug: string) {
  return story.find((section) => section.slug === slug);
}

/** Resolves a section's media references against the (already-filtered) asset list. */
export function storySectionMedia(section: StorySection | undefined, media: MediaAsset[]) {
  if (!section) return [];
  const byId = new Map(media.map((asset) => [asset.id, asset]));
  return section.content.mediaIds
    .map((id) => byId.get(id))
    .filter((asset): asset is MediaAsset => asset != null);
}

export function storySectionCredits(section: StorySection | undefined, credits: Credit[]) {
  if (!section) return [];
  const byId = new Map(credits.map((credit) => [credit.id, credit]));
  return section.content.creditIds
    .map((id) => byId.get(id))
    .filter((credit): credit is Credit => credit != null);
}

export function storySectionVideos(section: StorySection | undefined, videos: Video[]) {
  if (!section) return [];
  const byId = new Map(videos.map((video) => [video.id, video]));
  return section.content.videoIds
    .map((id) => byId.get(id))
    .filter((video): video is Video => video != null);
}

/** The experience strip reads stats from whichever public section carries them. */
export function publicStoryStats(story: StorySection[]) {
  for (const section of story) {
    if (section.content.stats.length) return section.content.stats;
  }
  return [];
}

/** Paragraph splitter for narrative bodies: blank line separates paragraphs. */
export function storyParagraphs(body: string) {
  return body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export function storySectionIsEmpty(section: StorySection) {
  const { summary, body, facts, stats, mediaIds, videoIds, creditIds } = section.content;
  return !summary.trim() && !body.trim() && !facts.length && !stats.length && !mediaIds.length && !videoIds.length && !creditIds.length;
}

/**
 * Minor-era classification boundary.
 *
 * Phase 2A establishes the durable flag only. It intentionally does NOT change
 * visibility behaviour: `public` remains the single gate for publication, and nothing
 * is auto-published or auto-hidden. Later phases must consult these helpers before
 * running any inference, matching, or fit feature over Emma's media.
 */
export const minorEraPolicy = {
  /** Later phases must not run biometric or pose analysis on minor-era material. */
  allowBiometricAnalysis: false,
  /** Later phases must not use minor-era material for casting/brand matching or fit. */
  allowMatchingAndFit: false,
  /** Later phases may derive only garment/scene descriptors, never personal inference. */
  allowUnrestrictedInference: false,
  /** Publication always stays a deliberate per-item decision by Emma in Studio. */
  requiresDeliberatePublication: true,
} as const;

export function isMinorEraAsset(asset: Pick<MediaAsset, "minorEra">) {
  return asset.minorEra === true;
}

export function minorEraAssetIds(media: Pick<MediaAsset, "id" | "minorEra">[]) {
  return new Set(media.filter(isMinorEraAsset).map((asset) => asset.id));
}

/** Reusable exclusion for any future analysis pipeline. Not wired to anything in Phase 2A. */
export function excludeMinorEraAssets<T extends Pick<MediaAsset, "minorEra">>(media: T[]) {
  return media.filter((asset) => !isMinorEraAsset(asset));
}

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
  // Public credits are always chronological, newest first. Studio keeps its own
  // manual order; the public site derives ordering from the credit date so a new
  // show never has to be dragged into place.
  const publicCredits = sortCreditsNewestFirst(
    data.credits
      .filter((credit) => credit.public && credit.priority !== "hidden")
      .map((credit) => ({ ...credit, venue: "", notes: "", designerBase: "" })),
  );
  const publicVideos = data.videos.filter((video) => video.public);
  const publicCreditIds = new Set(publicCredits.map((credit) => credit.id));
  const publicVideoIds = new Set(publicVideos.map((video) => video.id));
  return {
    profile,
    credits: publicCredits,
    media: publicMedia.map((asset) => ({ ...asset, url: "" })),
    videos: publicVideos,
    // A public story section may only reference records that are themselves public.
    // Referencing a private asset never publishes it, and never leaks its existence.
    story: normalizeStory(data.story)
      .filter((section) => section.public)
      .map((section) => ({
        ...section,
        content: {
          ...section.content,
          mediaIds: section.content.mediaIds.filter((id) => publicIds.has(id)),
          videoIds: section.content.videoIds.filter((id) => publicVideoIds.has(id)),
          creditIds: section.content.creditIds.filter((id) => publicCreditIds.has(id)),
        },
      })),
    settings: {
      ...settings,
      heroMediaId: publicHero,
      compCardPrimaryMediaId: publicIds.has(settings.compCardPrimaryMediaId) ? settings.compCardPrimaryMediaId : "",
      compCardMediaIds: settings.compCardMediaIds.filter((id) => publicIds.has(id)),
    },
  };
}

/* ────────────────────────── Credit chronology ──────────────────────────
 * Runway credits are entered by hand, so `year` is a human string rather than a
 * date: "September 2021", "July 25, 2026", "~2018–2020", "2021–2023". The public
 * site must always read newest → oldest without Emma having to reorder rows in
 * Studio, so ordering is derived from that string rather than stored.
 *
 * The parse is deliberately forgiving and never throws: an unparseable value
 * sorts last (oldest) instead of corrupting the order of everything else.
 */

const monthNames = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/**
 * Collapses a free-text credit date into a comparable YYYYMMDD number.
 * A range ("2021–2023") resolves to its latest year, because that is when the
 * body of work most recently happened. A year with no month sorts mid-year so it
 * never jumps ahead of a dated show in the same year.
 */
export function creditDateValue(year: string): number {
  if (typeof year !== "string") return 0;
  const value = year.toLowerCase();
  const years = [...value.matchAll(/\b(?:19|20)\d{2}\b/g)].map((match) => Number(match[0]));
  if (!years.length) return 0;
  const resolvedYear = Math.max(...years);
  const monthIndex = monthNames.findIndex((month) => value.includes(month));
  const month = monthIndex >= 0 ? monthIndex + 1 : 7;
  const withoutYears = value.replace(/\b(?:19|20)\d{2}\b/g, " ");
  const dayMatch = withoutYears.match(/\b(\d{1,2})\b/);
  const day = monthIndex >= 0 && dayMatch ? Math.min(Number(dayMatch[1]), 31) : 15;
  return resolvedYear * 10000 + month * 100 + day;
}

/** Newest first, stable for ties, non-mutating. */
export function sortCreditsNewestFirst<T extends { year: string }>(items: T[]): T[] {
  return items
    .map((item, index) => ({ item, index, value: creditDateValue(item.year) }))
    .sort((a, b) => (b.value - a.value) || (a.index - b.index))
    .map((entry) => entry.item);
}

/* ─────────────────────── Credit ↔ media association ───────────────────────
 * A credit and the assets from that show are joined on the metadata Emma
 * already enters — designer, event and date — rather than on a new foreign key,
 * so the association survives re-uploads and needs no migration. The join is
 * exact after normalization; a partially filled asset simply does not link,
 * which is why a credit with no matching asset renders no link at all.
 */

function joinToken(value: string) {
  return typeof value === "string"
    ? value.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim()
    : "";
}

function creditJoinKey(credit: Pick<Credit, "designer" | "event" | "year">) {
  return [joinToken(credit.designer), joinToken(credit.event), joinToken(credit.year)];
}

/** Public assets photographed at this credit's show, in library order. */
export function creditMedia(credit: Credit, media: MediaAsset[]): MediaAsset[] {
  const [designer, event, year] = creditJoinKey(credit);
  if (!designer || !event || !year) return [];
  return media.filter((asset) =>
    joinToken(asset.designer) === designer &&
    joinToken(asset.event) === event &&
    joinToken(asset.date) === year);
}

/** Public video captured at this credit's show. Videos carry no event field. */
export function creditVideos(credit: Credit, videos: Video[]): Video[] {
  const designer = joinToken(credit.designer);
  const year = joinToken(credit.year);
  if (!designer || !year) return [];
  return videos.filter((video) => joinToken(video.designer) === designer && joinToken(video.year) === year);
}

/** True when a credit has something to show — the only case that earns a link. */
export function creditHasShowPage(credit: Credit, media: MediaAsset[], videos: Video[]) {
  return creditMedia(credit, media).length > 0 || creditVideos(credit, videos).length > 0;
}

/** Credits that resolve to a show page, newest first. Used by the sitemap. */
export function creditsWithShowPages(data: PortfolioData): Credit[] {
  return sortCreditsNewestFirst(
    data.credits.filter((credit) => credit.public && credit.priority !== "hidden" && creditHasShowPage(credit, data.media, data.videos)),
  );
}

export function creditHeadline(credit: Credit) {
  return credit.designer || credit.event || "Runway";
}

export function creditMeta(credit: Credit) {
  return [credit.event, credit.showName, [credit.city, credit.country].filter(Boolean).join(", "), credit.year]
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * The strongest image to represent a designer on a card.
 *
 * Resolves against the whole media library rather than a story section's explicit
 * `mediaIds`, because a section lists a handful of picks while the library already
 * records which designer each asset belongs to. Featured wins, then library order.
 * Returns undefined when the designer has no public image — the card then shows its
 * restrained monogram rather than a broken tile. No association is invented: the
 * match is on the designer name the asset itself carries.
 */
export function designerCoverAsset(name: string, media: MediaAsset[], placed?: Set<string>): MediaAsset | undefined {
  const designer = joinToken(name);
  if (!designer) return undefined;
  const matches = media.filter((asset) => asset.public && joinToken(asset.designer) === designer);
  const pick = (pool: MediaAsset[]) => pool.find((asset) => asset.featured) ?? pool[0];
  // Prefer a frame the homepage has not already spent, so a designer card earns its
  // place instead of echoing the gallery above it. Falling back to a shown asset is
  // still better than a monogram when the designer genuinely has legitimate media.
  const unspent = placed ? matches.filter((asset) => !placed.has(asset.id)) : matches;
  return pick(unspent) ?? pick(matches);
}

/**
 * A designer with footage but no stills still deserves a real card. The poster frame
 * of that designer's public clip is canonical media — the video record already names
 * the designer — so it stands in rather than a monogram. Returns "" when the designer
 * has no public video.
 */
export function designerVideoPoster(name: string, videos: Video[]): string {
  const designer = joinToken(name);
  if (!designer) return "";
  const match = videos.find((video) => video.public && joinToken(video.designer) === designer);
  return match ? videoPosterSrc(match.url) : "";
}

/**
 * The poster frame that sits beside a video in the blob store, under the same key
 * with a .jpg extension. Lets a reel card show a real frame while the video itself
 * stays `preload="none"`. Returns "" when the URL is not one of our gateway paths;
 * a missing poster simply 404s and the browser falls back to a blank frame.
 */
export function videoPosterSrc(url: string): string {
  const match = /^\/api\/media\?key=(.+)$/.exec(url);
  if (!match) return "";
  const key = decodeURIComponent(match[1]);
  if (!key.toLowerCase().endsWith(".mp4")) return "";
  return mediaUrl(`${key.slice(0, -4)}.jpg`);
}

/* ───────────────────────── Homepage curation ─────────────────────────
 * The homepage is an edit, not an archive. Two rules produce it:
 *
 *   1. An asset appears at most once. The hero claims first, then Selected Work,
 *      then each gallery in order. Detail surfaces — /shows/<id>, the comp card,
 *      Studio — are unaffected; they read the library directly.
 *   2. No single shoot dominates. Assets are grouped by the look they show
 *      (designer + event + date + caption) and galleries take one per shoot per
 *      round, so a run reads as a mix of work rather than one set printed end to
 *      end. The per-shoot ceiling is counted across the whole page, so a frame
 *      promoted into Selected Work reduces what its shoot may still show below.
 *
 * Nothing here changes a record. An asset left off the homepage stays public and
 * keeps appearing on its show page, the comp card and the public API.
 */

export type GallerySpec = {
  key: string;
  categories: MediaCategory[];
  /** Most images this gallery may show. */
  limit: number;
  /** Most frames of one look the whole homepage may show. */
  maxPerShoot: number;
};

export type HomepageCuration = {
  hero?: MediaAsset;
  selectedWork: MediaAsset[];
  galleries: Record<string, MediaAsset[]>;
  /** Ids already spoken for, so later surfaces can avoid repeating them. */
  placed: Set<string>;
};

/** Identifies the look an asset shows. Two frames of one look share a key. */
export function mediaShootKey(asset: MediaAsset): string {
  const key = [asset.designer, asset.event, asset.date, asset.caption].map(joinToken).join("|");
  return key.replace(/\|/g, "") ? key : `asset:${asset.id}`;
}

export function curateHomepage(data: PortfolioData, specs: GallerySpec[], selectedWorkLimit = 6): HomepageCuration {
  const publicMedia = data.media.filter((asset) => asset.public);
  const byId = new Map(publicMedia.map((asset) => [asset.id, asset]));
  const placed = new Set<string>();
  const shootCount = new Map<string, number>();
  const claim = (asset: MediaAsset) => {
    placed.add(asset.id);
    const key = mediaShootKey(asset);
    shootCount.set(key, (shootCount.get(key) ?? 0) + 1);
    return asset;
  };

  const hero = publicMedia.find((asset) => asset.id === data.settings.heroMediaId)
    ?? publicMedia.find((asset) => asset.featured);
  if (hero) claim(hero);

  const archive = findStorySection(data.story, "selected-archive");
  const selectedWork = (archive?.content.mediaIds ?? [])
    .map((id) => byId.get(id))
    .filter((asset): asset is MediaAsset => Boolean(asset) && !placed.has(asset!.id))
    .slice(0, selectedWorkLimit)
    .map(claim);

  const galleries: Record<string, MediaAsset[]> = {};
  for (const spec of specs) {
    const pool = publicMedia.filter((asset) => spec.categories.includes(asset.category) && !placed.has(asset.id));
    const shoots = new Map<string, MediaAsset[]>();
    for (const asset of pool) {
      const key = mediaShootKey(asset);
      shoots.set(key, [...(shoots.get(key) ?? []), asset]);
    }
    const taken: MediaAsset[] = [];
    // Round-robin across shoots: one frame each per pass, so the run reads as a mix.
    for (let round = 0; round < spec.maxPerShoot && taken.length < spec.limit; round++) {
      for (const [key, queue] of shoots) {
        if (taken.length >= spec.limit) break;
        const next = queue[round];
        if (!next || (shootCount.get(key) ?? 0) >= spec.maxPerShoot) continue;
        taken.push(claim(next));
      }
    }
    galleries[spec.key] = taken;
  }

  return { hero, selectedWork, galleries, placed };
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
    Array.isArray(candidate.videos) &&
    // `story` is optional so an older client payload is still accepted; it is
    // normalized to a safe shape on both read and write.
    (candidate.story === undefined || Array.isArray(candidate.story)),
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
  // A root-relative path is valid: the blob store is private, so a video's URL is
  // its own `/api/media?key=…` gateway path rather than an absolute blob URL.
  if (value.startsWith("/")) return !value.startsWith("//");
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

import { asc, eq, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import type { MediaCategory, PortfolioData, Profile } from "../lib/portfolio";
import { defaultPortfolio, mediaUrl, normalizeFocalPoint, normalizeSettings, normalizeStory, normalizeStoryContent } from "../lib/portfolio";
import { getDb } from "./client";
import { contentSections, mediaAssets, portfolioSettings, portfolioVideos, profiles, runwayCredits } from "./schema";

let demoPortfolio = structuredClone(defaultPortfolio);

function demoMode() {
  return process.env.NODE_ENV !== "production" && process.env.PORTFOLIO_DEMO_MODE === "true";
}

export async function readPortfolio(): Promise<PortfolioData> {
  if (demoMode()) return structuredClone(demoPortfolio);
  const db = getDb();
  const [profileRows, settingsRows, credits, assets, videos, sections] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.id, 1)).limit(1),
    db.select().from(portfolioSettings).where(eq(portfolioSettings.id, 1)).limit(1),
    db.select().from(runwayCredits).orderBy(asc(runwayCredits.sortOrder)),
    db.select().from(mediaAssets).orderBy(asc(mediaAssets.sortOrder)),
    db.select().from(portfolioVideos).orderBy(asc(portfolioVideos.sortOrder)),
    db.select().from(contentSections).orderBy(asc(contentSections.sortOrder)),
  ]);

  const profileRow = profileRows[0];
  const settingsRow = settingsRows[0];
  const profile: Profile = profileRow ? {
    fullName: profileRow.fullName,
    professionalName: profileRow.professionalName,
    age: profileRow.age,
    city: profileRow.city,
    country: profileRow.country,
    email: profileRow.email,
    phone: profileRow.phone,
    instagram: profileRow.instagram,
    tiktok: profileRow.tiktok,
    website: profileRow.website,
    agency: profileRow.agency,
    bookingContact: profileRow.bookingContact,
    bio: profileRow.bio,
    height: profileRow.height,
    bust: profileRow.bust,
    waist: profileRow.waist,
    hips: profileRow.hips,
    dressSize: profileRow.dressSize,
    shoeSize: profileRow.shoeSize,
    hair: profileRow.hair,
    eyes: profileRow.eyes,
    ethnicity: profileRow.ethnicity,
    languages: profileRow.languages,
    citizenship: profileRow.citizenship,
    travelAvailability: profileRow.travelAvailability,
    workAuthorization: profileRow.workAuthorization,
    visibility: { ...defaultPortfolio.profile.visibility, ...profileRow.visibility },
  } : defaultPortfolio.profile;

  return {
    profile,
    credits: credits.map((credit) => ({
      id: credit.id,
      event: credit.event,
      designer: credit.designer,
      showName: credit.showName,
      city: credit.city,
      country: credit.country,
      year: credit.year,
      venue: credit.venue,
      notes: credit.notes,
      designerBase: credit.designerBase,
      priority: credit.priority,
      verified: credit.verified,
      public: credit.isPublic,
    })),
    media: assets.map((asset) => ({
      id: asset.id,
      key: asset.storageKey,
      url: mediaUrl(asset.storageKey),
      filename: asset.filename,
      mimeType: asset.mimeType,
      size: asset.size,
      category: asset.category as MediaCategory,
      caption: asset.caption,
      photographer: asset.photographer,
      designer: asset.designer,
      event: asset.event,
      date: asset.date,
      featured: asset.featured,
      public: asset.isPublic,
      minorEra: asset.minorEra,
      focalPoint: normalizeFocalPoint(asset.focalPoint),
    })),
    videos: videos.map((video) => ({
      id: video.id,
      url: video.url,
      label: video.label,
      designer: video.designer,
      year: video.year,
      primary: video.primary,
      public: video.isPublic,
    })),
    story: normalizeStory(sections.map((section) => ({
      slug: section.slug,
      title: section.title,
      content: section.content,
      public: section.isPublic,
      sortOrder: section.sortOrder,
    }))),
    settings: settingsRow ? normalizeSettings({
      heroMediaId: settingsRow.heroMediaId,
      publicSite: settingsRow.publicSite,
      baseLine: settingsRow.baseLine,
      selectedServices: settingsRow.selectedServices,
      lastPublishedAt: settingsRow.lastPublishedAt,
      availabilityStatus: settingsRow.availabilityStatus,
      primaryMarket: settingsRow.primaryMarket,
      travelAvailable: settingsRow.travelAvailable,
      additionalMarkets: settingsRow.additionalMarkets,
      availabilityNote: settingsRow.availabilityNote,
      compCardPrimaryMediaId: settingsRow.compCardPrimaryMediaId,
      compCardMediaIds: settingsRow.compCardMediaIds,
    }) : defaultPortfolio.settings,
  };
}

export async function savePortfolio(data: PortfolioData) {
  if (demoMode()) {
    demoPortfolio = structuredClone(data);
    return;
  }
  const db = getDb();
  const updatedAt = new Date();
  const writes: [BatchItem<"pg">, ...BatchItem<"pg">[]] = [
    db.insert(profiles).values({ id: 1, ...data.profile, updatedAt })
      .onConflictDoUpdate({ target: profiles.id, set: { ...data.profile, updatedAt } }),
    db.insert(portfolioSettings).values({ id: 1, ...normalizeSettings(data.settings), updatedAt })
      .onConflictDoUpdate({ target: portfolioSettings.id, set: { ...normalizeSettings(data.settings), updatedAt } }),
    db.delete(runwayCredits),
    db.delete(mediaAssets),
    db.delete(portfolioVideos),
  ];

  if (data.credits.length) {
    writes.push(db.insert(runwayCredits).values(data.credits.map((credit, sortOrder) => ({
      id: credit.id,
      event: credit.event,
      designer: credit.designer,
      showName: credit.showName,
      city: credit.city,
      country: credit.country,
      year: credit.year,
      venue: credit.venue,
      notes: credit.notes,
      designerBase: credit.designerBase,
      priority: credit.priority,
      verified: credit.verified,
      isPublic: credit.public,
      sortOrder,
      updatedAt,
    }))));
  }
  if (data.media.length) {
    writes.push(db.insert(mediaAssets).values(data.media.map((asset, sortOrder) => ({
      id: asset.id,
      storageKey: asset.key,
      filename: asset.filename,
      mimeType: asset.mimeType ?? "application/octet-stream",
      size: asset.size ?? 0,
      category: asset.category,
      caption: asset.caption,
      photographer: asset.photographer,
      designer: asset.designer,
      event: asset.event,
      date: asset.date,
      featured: asset.featured,
      isPublic: asset.public,
      minorEra: asset.minorEra === true,
      focalPoint: asset.focalPoint,
      sortOrder,
      updatedAt,
    }))));
  }
  if (data.videos.length) {
    writes.push(db.insert(portfolioVideos).values(data.videos.map((video, sortOrder) => ({
      id: video.id,
      url: video.url,
      label: video.label,
      designer: video.designer,
      year: video.year,
      primary: video.primary,
      isPublic: video.public,
      sortOrder,
      updatedAt,
    }))));
  }
  // Story sections are upserted by slug rather than replaced wholesale. Credits, media and
  // videos are client-owned collections, but `content_sections` is a stable catalogue keyed
  // by slug: never delete a row Studio simply did not send. Deletion is intentionally not
  // supported in Phase 2A — a section is retired by clearing it and leaving it private.
  const story = normalizeStory(data.story);
  if (story.length) {
    writes.push(db.insert(contentSections).values(story.map((section, sortOrder) => ({
      slug: section.slug,
      title: section.title,
      content: normalizeStoryContent(section.content) as unknown as Record<string, unknown>,
      isPublic: section.public,
      sortOrder,
      updatedAt,
    }))).onConflictDoUpdate({
      target: contentSections.slug,
      set: {
        title: sql`excluded.title`,
        content: sql`excluded.content`,
        isPublic: sql`excluded.is_public`,
        sortOrder: sql`excluded.sort_order`,
        updatedAt,
      },
    }));
  }

  await db.batch(writes);
}

export async function findMedia(storageKey: string) {
  if (demoMode()) {
    const asset = demoPortfolio.media.find((item) => item.key === storageKey);
    return asset ? { ...asset, storageKey: asset.key, isPublic: asset.public, mimeType: asset.mimeType ?? "application/octet-stream", size: asset.size ?? 0 } : null;
  }
  const [asset] = await getDb().select().from(mediaAssets).where(eq(mediaAssets.storageKey, storageKey)).limit(1);
  return asset ?? null;
}

/**
 * Resolves the visibility of anything `/api/media` is asked to serve.
 *
 * The blob store is private-only, so runway footage has to come through the same
 * gateway as photography. A video is not a `media_assets` row — the schema models
 * it as an arbitrary URL — so it is matched by the URL it was given, which is the
 * `mediaUrl()` of its own blob key. Photography is checked first; a video is only
 * consulted when no asset owns the key.
 */
export async function findServableMedia(storageKey: string) {
  const asset = await findMedia(storageKey);
  if (asset) return { isPublic: asset.isPublic };
  const url = mediaUrl(storageKey);
  if (!url) return null;
  if (demoMode()) {
    const video = demoPortfolio.videos.find((item) => item.url === url);
    if (video) return { isPublic: video.public };
    return findVideoPoster(storageKey);
  }
  const [video] = await getDb().select().from(portfolioVideos).where(eq(portfolioVideos.url, url)).limit(1);
  if (video) return { isPublic: video.isPublic };
  return findVideoPoster(storageKey);
}

/**
 * A poster frame lives beside its video under the same key with a .jpg extension.
 * It is not a record of its own — it inherits the video's visibility exactly, so a
 * private clip's first frame stays private. Anything that is not a .jpg sibling of
 * a real video row resolves to nothing.
 */
async function findVideoPoster(storageKey: string) {
  if (!storageKey.toLowerCase().endsWith(".jpg")) return null;
  const videoUrl = mediaUrl(`${storageKey.slice(0, -4)}.mp4`);
  if (!videoUrl) return null;
  if (demoMode()) {
    const video = demoPortfolio.videos.find((item) => item.url === videoUrl);
    return video ? { isPublic: video.public } : null;
  }
  const [video] = await getDb().select().from(portfolioVideos).where(eq(portfolioVideos.url, videoUrl)).limit(1);
  return video ? { isPublic: video.isPublic } : null;
}

export async function deleteMediaRecord(storageKey: string) {
  if (demoMode()) {
    demoPortfolio.media = demoPortfolio.media.filter((item) => item.key !== storageKey);
    return;
  }
  await getDb().delete(mediaAssets).where(eq(mediaAssets.storageKey, storageKey));
}

export async function replaceMediaStorageKey(oldKey: string, newKey: string, mimeType?: string, size?: number) {
  if (demoMode()) {
    demoPortfolio.media = demoPortfolio.media.map((item) => item.key === oldKey ? { ...item, key: newKey, url: mediaUrl(newKey), mimeType, size } : item);
    return;
  }
  await getDb().update(mediaAssets).set({ storageKey: newKey, mimeType, size, updatedAt: new Date() }).where(eq(mediaAssets.storageKey, oldKey));
}

export async function seedPortfolio() {
  if (demoMode()) {
    demoPortfolio = structuredClone(defaultPortfolio);
    return;
  }
  await savePortfolio(defaultPortfolio);
  const db = getDb();
  const futureSections = ["about-emma", "modeling-journey", "selected-archive", "selected-runway", "fashion-weeks", "designers", "editorial", "campaigns", "beauty", "dubai", "international-availability"];
  await db.insert(contentSections).values(futureSections.map((slug, sortOrder) => ({ slug, title: slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "), content: {}, isPublic: false, sortOrder }))).onConflictDoNothing();
}

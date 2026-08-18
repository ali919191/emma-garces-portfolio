import { asc, eq } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import type { MediaCategory, PortfolioData, Profile } from "../lib/portfolio";
import { defaultPortfolio, mediaUrl } from "../lib/portfolio";
import { getDb } from "./client";
import { contentSections, mediaAssets, portfolioSettings, portfolioVideos, profiles, runwayCredits } from "./schema";

let demoPortfolio = structuredClone(defaultPortfolio);

function demoMode() {
  return process.env.NODE_ENV !== "production" && process.env.PORTFOLIO_DEMO_MODE === "true";
}

export async function readPortfolio(): Promise<PortfolioData> {
  if (demoMode()) return structuredClone(demoPortfolio);
  const db = getDb();
  const [profileRows, settingsRows, credits, assets, videos] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.id, 1)).limit(1),
    db.select().from(portfolioSettings).where(eq(portfolioSettings.id, 1)).limit(1),
    db.select().from(runwayCredits).orderBy(asc(runwayCredits.sortOrder)),
    db.select().from(mediaAssets).orderBy(asc(mediaAssets.sortOrder)),
    db.select().from(portfolioVideos).orderBy(asc(portfolioVideos.sortOrder)),
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
    visibility: profileRow.visibility,
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
      focalPoint: asset.focalPoint,
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
    settings: settingsRow ? {
      heroMediaId: settingsRow.heroMediaId,
      publicSite: settingsRow.publicSite,
      baseLine: settingsRow.baseLine,
      selectedServices: settingsRow.selectedServices,
      lastPublishedAt: settingsRow.lastPublishedAt,
    } : defaultPortfolio.settings,
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
    db.insert(portfolioSettings).values({ id: 1, ...data.settings, updatedAt })
      .onConflictDoUpdate({ target: portfolioSettings.id, set: { ...data.settings, updatedAt } }),
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

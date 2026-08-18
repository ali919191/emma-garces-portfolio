import { bigint, boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { VisibilityKey } from "../lib/portfolio";

export const profiles = pgTable("profiles", {
  id: integer("id").primaryKey().default(1),
  fullName: text("full_name").notNull(),
  professionalName: text("professional_name").notNull(),
  age: text("age").notNull().default(""),
  city: text("city").notNull().default(""),
  country: text("country").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  tiktok: text("tiktok").notNull().default(""),
  website: text("website").notNull().default(""),
  agency: text("agency").notNull().default(""),
  bookingContact: text("booking_contact").notNull().default(""),
  bio: text("bio").notNull().default(""),
  height: text("height").notNull().default(""),
  bust: text("bust").notNull().default(""),
  waist: text("waist").notNull().default(""),
  hips: text("hips").notNull().default(""),
  dressSize: text("dress_size").notNull().default(""),
  shoeSize: text("shoe_size").notNull().default(""),
  hair: text("hair").notNull().default(""),
  eyes: text("eyes").notNull().default(""),
  ethnicity: text("ethnicity").notNull().default(""),
  languages: text("languages").notNull().default(""),
  citizenship: text("citizenship").notNull().default(""),
  travelAvailability: text("travel_availability").notNull().default(""),
  workAuthorization: text("work_authorization").notNull().default(""),
  visibility: jsonb("visibility").$type<Record<VisibilityKey, boolean>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const portfolioSettings = pgTable("portfolio_settings", {
  id: integer("id").primaryKey().default(1),
  heroMediaId: text("hero_media_id").notNull().default(""),
  publicSite: boolean("public_site").notNull().default(true),
  baseLine: text("base_line").notNull().default(""),
  selectedServices: jsonb("selected_services").$type<string[]>().notNull(),
  lastPublishedAt: text("last_published_at").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const runwayCredits = pgTable("runway_credits", {
  id: text("id").primaryKey(),
  event: text("event").notNull().default(""),
  designer: text("designer").notNull().default(""),
  showName: text("show_name").notNull().default(""),
  city: text("city").notNull().default(""),
  country: text("country").notNull().default(""),
  year: text("year").notNull().default(""),
  venue: text("venue").notNull().default(""),
  notes: text("notes").notNull().default(""),
  designerBase: text("designer_base").notNull().default(""),
  priority: text("priority").$type<"featured" | "standard" | "hidden">().notNull().default("standard"),
  verified: boolean("verified").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey(),
  storageKey: text("storage_key").notNull().unique(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull().default("application/octet-stream"),
  size: bigint("size", { mode: "number" }).notNull().default(0),
  category: text("category").notNull(),
  caption: text("caption").notNull().default(""),
  photographer: text("photographer").notNull().default(""),
  designer: text("designer").notNull().default(""),
  event: text("event").notNull().default(""),
  date: text("date").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(false),
  focalPoint: text("focal_point").$type<"center" | "top" | "bottom">().notNull().default("center"),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const portfolioVideos = pgTable("portfolio_videos", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  label: text("label").notNull().default(""),
  designer: text("designer").notNull().default(""),
  year: text("year").notNull().default(""),
  primary: boolean("is_primary").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentSections = pgTable("content_sections", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  isPublic: boolean("is_public").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

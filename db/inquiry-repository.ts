import { and, desc, eq, gte } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { BookingInquiry, InquiryStatus } from "../lib/inquiries";
import { getDb } from "./client";
import { bookingInquiries } from "./schema";

let demoInquiries: BookingInquiry[] = [];

function demoMode() {
  return process.env.NODE_ENV !== "production" && process.env.PORTFOLIO_DEMO_MODE === "true";
}

function toInquiry(row: typeof bookingInquiries.$inferSelect): BookingInquiry {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    status: row.status,
    inquiryType: row.inquiryType as BookingInquiry["inquiryType"],
    contactName: row.contactName,
    company: row.company,
    email: row.email,
    phone: row.phone,
    projectName: row.projectName,
    proposedDates: row.proposedDates,
    location: row.location,
    details: row.details,
    budgetRange: row.budgetRange,
    preferredContact: row.preferredContact,
    source: row.source,
    referrer: row.referrer,
    utmSource: row.utmSource,
    utmMedium: row.utmMedium,
    utmCampaign: row.utmCampaign,
    utmContent: row.utmContent,
    utmTerm: row.utmTerm,
  };
}

export async function listInquiries() {
  if (demoMode()) return [...demoInquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows = await getDb().select().from(bookingInquiries).orderBy(desc(bookingInquiries.createdAt));
  return rows.map(toInquiry);
}

export async function countRecentInquiries(email: string, withinMs: number) {
  const since = new Date(Date.now() - withinMs);
  if (demoMode()) return demoInquiries.filter((item) => item.email === email && item.createdAt >= since.toISOString()).length;
  const matches = await getDb().select({ id: bookingInquiries.id }).from(bookingInquiries).where(and(eq(bookingInquiries.email, email), gte(bookingInquiries.createdAt, since)));
  return matches.length;
}

export async function createInquiry(input: Omit<BookingInquiry, "id" | "createdAt" | "updatedAt" | "status">) {
  const now = new Date();
  const inquiry: BookingInquiry = {
    ...input,
    id: randomUUID(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: "new",
  };
  if (demoMode()) {
    demoInquiries = [inquiry, ...demoInquiries];
    return inquiry;
  }
  await getDb().insert(bookingInquiries).values({
    ...inquiry,
    createdAt: now,
    updatedAt: now,
  });
  return inquiry;
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  const updatedAt = new Date();
  if (demoMode()) {
    demoInquiries = demoInquiries.map((item) => item.id === id ? { ...item, status, updatedAt: updatedAt.toISOString() } : item);
    return demoInquiries.find((item) => item.id === id) ?? null;
  }
  await getDb().update(bookingInquiries).set({ status, updatedAt }).where(eq(bookingInquiries.id, id));
  const [row] = await getDb().select().from(bookingInquiries).where(eq(bookingInquiries.id, id)).limit(1);
  return row ? toInquiry(row) : null;
}

export async function inquirySummary() {
  const inquiries = await listInquiries();
  const byStatus = inquiries.reduce<Record<string, number>>((counts, inquiry) => {
    counts[inquiry.status] = (counts[inquiry.status] ?? 0) + 1;
    return counts;
  }, {});
  return { total: inquiries.length, byStatus, latest: inquiries[0] ?? null };
}

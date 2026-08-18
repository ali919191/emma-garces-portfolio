export const inquiryTypes = ["Modeling", "Runway", "Editorial", "Commercial", "Brand Partnership", "Photography", "Other"] as const;
export const inquiryStatuses = ["new", "reviewing", "responded", "booked", "closed", "spam"] as const;
export const budgetRanges = ["", "To be discussed", "Under $5,000", "$5,000–$15,000", "$15,000–$40,000", "$40,000+"] as const;
export const contactMethods = ["", "Email", "Phone", "Either"] as const;

export type InquiryType = (typeof inquiryTypes)[number];
export type InquiryStatus = (typeof inquiryStatuses)[number];

export type BookingInquiry = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: InquiryStatus;
  inquiryType: InquiryType;
  contactName: string;
  company: string;
  email: string;
  phone: string;
  projectName: string;
  proposedDates: string;
  location: string;
  details: string;
  budgetRange: string;
  preferredContact: string;
  source: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
};

export type InquiryInput = {
  contactName?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  inquiryType?: unknown;
  projectName?: unknown;
  proposedDates?: unknown;
  location?: unknown;
  details?: unknown;
  budgetRange?: unknown;
  preferredContact?: unknown;
  websiteUrl?: unknown;
  formStartedAt?: unknown;
  source?: unknown;
  referrer?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmContent?: unknown;
  utmTerm?: unknown;
};

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return Array.from(value).filter((character) => {
    const code = character.charCodeAt(0);
    return code >= 32 && code !== 127;
  }).join("").trim().slice(0, max);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function parseInquirySubmission(input: InquiryInput) {
  const honeypot = clean(input.websiteUrl, 200);
  if (honeypot) return { ok: false as const, spam: true, error: "Unable to send this inquiry." };

  const started = Number(input.formStartedAt);
  if (!Number.isFinite(started) || Date.now() - started < 1500) {
    return { ok: false as const, spam: true, error: "Unable to send this inquiry." };
  }

  const contactName = clean(input.contactName, 120);
  const email = clean(input.email, 254).toLowerCase();
  const inquiryType = inquiryTypes.find((type) => type === input.inquiryType);
  if (contactName.length < 2) return { ok: false as const, spam: false, error: "Please add your name." };
  if (!isEmail(email)) return { ok: false as const, spam: false, error: "Please add a valid email address." };
  if (!inquiryType) return { ok: false as const, spam: false, error: "Please choose an inquiry type." };

  const preferredContact = contactMethods.includes(input.preferredContact as (typeof contactMethods)[number])
    ? String(input.preferredContact)
    : "";
  const budgetRange = budgetRanges.includes(input.budgetRange as (typeof budgetRanges)[number])
    ? String(input.budgetRange)
    : clean(input.budgetRange, 80);

  return {
    ok: true as const,
    spam: false,
    data: {
      contactName,
      company: clean(input.company, 160),
      email,
      phone: clean(input.phone, 40),
      inquiryType,
      projectName: clean(input.projectName, 160),
      proposedDates: clean(input.proposedDates, 120),
      location: clean(input.location, 160),
      details: clean(input.details, 8000),
      budgetRange,
      preferredContact,
      source: clean(input.source, 80) || "website",
      referrer: clean(input.referrer, 500),
      utmSource: clean(input.utmSource, 120),
      utmMedium: clean(input.utmMedium, 120),
      utmCampaign: clean(input.utmCampaign, 160),
      utmContent: clean(input.utmContent, 160),
      utmTerm: clean(input.utmTerm, 160),
    },
  };
}

export function isInquiryStatus(value: unknown): value is InquiryStatus {
  return inquiryStatuses.includes(value as InquiryStatus);
}

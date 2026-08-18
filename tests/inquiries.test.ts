import { describe, expect, it } from "vitest";
import { parseInquirySubmission, isInquiryStatus } from "../lib/inquiries";

describe("booking inquiry validation", () => {
  const valid = {
    contactName: "Alex Casting",
    email: "alex@agency.example",
    inquiryType: "Runway",
    formStartedAt: Date.now() - 4000,
    websiteUrl: "",
  };

  it("accepts a professional inquiry without requiring every field", () => {
    const result = parseInquirySubmission(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe("alex@agency.example");
      expect(result.data.inquiryType).toBe("Runway");
      expect(result.data.phone).toBe("");
    }
  });

  it("requires name, email, and inquiry type", () => {
    expect(parseInquirySubmission({ ...valid, contactName: "A" }).ok).toBe(false);
    expect(parseInquirySubmission({ ...valid, email: "not-an-email" }).ok).toBe(false);
    expect(parseInquirySubmission({ ...valid, inquiryType: "Vacation" }).ok).toBe(false);
  });

  it("treats honeypot and instant submits as spam without leaking details", () => {
    const honey = parseInquirySubmission({ ...valid, websiteUrl: "https://spam.test" });
    expect(honey.ok).toBe(false);
    if (!honey.ok) expect(honey.spam).toBe(true);
    const fast = parseInquirySubmission({ ...valid, formStartedAt: Date.now() });
    expect(fast.ok).toBe(false);
    if (!fast.ok) expect(fast.spam).toBe(true);
  });

  it("accepts only known inquiry statuses", () => {
    expect(isInquiryStatus("reviewing")).toBe(true);
    expect(isInquiryStatus("deleted")).toBe(false);
  });
});

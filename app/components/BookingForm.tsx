"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { analyticsEvents, trackEvent } from "../../lib/analytics";
import { budgetRanges, contactMethods, inquiryTypes } from "../../lib/inquiries";

const initial = {
  contactName: "",
  company: "",
  email: "",
  phone: "",
  inquiryType: "Modeling",
  projectName: "",
  proposedDates: "",
  location: "",
  details: "",
  budgetRange: "To be discussed",
  preferredContact: "Email",
  websiteUrl: "",
};

export function BookingForm() {
  const started = useRef(0);
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const startedTracking = useRef(false);

  useEffect(() => { started.current = Date.now(); }, []);

  function update(key: keyof typeof initial, value: string) {
    if (!startedTracking.current) {
      startedTracking.current = true;
    void trackEvent(analyticsEvents.bookingFormStart);
    }
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const params = new URLSearchParams(window.location.search);
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...values,
        formStartedAt: started.current,
        source: "book-emma",
        referrer: document.referrer || "",
        utmSource: params.get("utm_source") || "",
        utmMedium: params.get("utm_medium") || "",
        utmCampaign: params.get("utm_campaign") || "",
        utmContent: params.get("utm_content") || "",
        utmTerm: params.get("utm_term") || "",
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setStatus("error");
      setMessage(payload.error || "Unable to send this inquiry.");
      return;
    }
    setStatus("sent");
    setValues(initial);
    void trackEvent(analyticsEvents.bookingInquirySubmitted, { inquiry_type: values.inquiryType });
  }

  if (status === "sent") {
    return (
      <div className="booking-success">
        <p>Inquiry received.</p>
        <h2>Thank you. Emma’s team will review this and follow up.</h2>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={submit} noValidate>
      <div className="form-grid two">
        <label className="field"><span>Contact name <b>*</b></span><input value={values.contactName} onChange={(event) => update("contactName", event.target.value)} autoComplete="name" required /></label>
        <label className="field"><span>Company / agency / brand</span><input value={values.company} onChange={(event) => update("company", event.target.value)} autoComplete="organization" /></label>
        <label className="field"><span>Email <b>*</b></span><input type="email" value={values.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" required /></label>
        <label className="field"><span>Phone</span><input type="tel" value={values.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" /></label>
        <label className="field"><span>Inquiry type <b>*</b></span>
          <select value={values.inquiryType} onChange={(event) => update("inquiryType", event.target.value)}>
            {inquiryTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="field"><span>Project / campaign</span><input value={values.projectName} onChange={(event) => update("projectName", event.target.value)} /></label>
        <label className="field"><span>Proposed dates</span><input value={values.proposedDates} onChange={(event) => update("proposedDates", event.target.value)} placeholder="Date or date range" /></label>
        <label className="field"><span>Location</span><input value={values.location} onChange={(event) => update("location", event.target.value)} /></label>
        <label className="field"><span>Budget range</span>
          <select value={values.budgetRange} onChange={(event) => update("budgetRange", event.target.value)}>
            {budgetRanges.filter(Boolean).map((range) => <option key={range}>{range}</option>)}
          </select>
        </label>
        <label className="field"><span>Preferred contact</span>
          <select value={values.preferredContact} onChange={(event) => update("preferredContact", event.target.value)}>
            {contactMethods.filter(Boolean).map((method) => <option key={method}>{method}</option>)}
          </select>
        </label>
      </div>
      <label className="field full"><span>Project details</span><textarea rows={5} value={values.details} onChange={(event) => update("details", event.target.value)} placeholder="Casting notes, usage, fitting, or timeline." /></label>
      <label className="hp" aria-hidden="true"><span>Company website</span><input tabIndex={-1} autoComplete="off" value={values.websiteUrl} onChange={(event) => update("websiteUrl", event.target.value)} /></label>
      {message && <p className="booking-error">{message}</p>}
      <button className="button dark" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send inquiry"}</button>
    </form>
  );
}

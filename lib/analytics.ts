export const analyticsEvents = {
  portfolioView: "portfolio_view",
  galleryView: "gallery_view",
  bookingCtaClick: "booking_cta_click",
  bookingFormStart: "booking_form_start",
  bookingInquirySubmitted: "booking_inquiry_submitted",
  compCardView: "comp_card_view",
  compCardDownload: "comp_card_download",
  socialOutboundClick: "social_outbound_click",
  harftOutboundClick: "harft_outbound_click",
} as const;

export type AnalyticsEvent = (typeof analyticsEvents)[keyof typeof analyticsEvents];

declare global {
  interface Window {
    va?: (action: "event", payload: { name: string; data?: Record<string, string> }) => void;
  }
}

export function trackEvent(event: AnalyticsEvent, properties?: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.va?.("event", properties ? { name: event, data: properties } : { name: event });
}

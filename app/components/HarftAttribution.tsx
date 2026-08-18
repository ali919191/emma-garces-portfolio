"use client";

import { analyticsEvents, trackEvent } from "../../lib/analytics";

export function HarftAttribution({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const src = tone === "light" ? "/partners/harft-ai-logo-on-light.svg" : "/partners/harft-ai-logo-on-dark.svg";
  return (
    <aside className={`harft-attribution ${tone}`}>
      <a
        href="https://harftai.com"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => { void trackEvent(analyticsEvents.harftOutboundClick, { destination: "harftai.com" }); }}
      >
        <img src={src} alt="HARFT AI" width={180} height={40} />
        <span>Digital Experience by HARFT AI</span>
        <small>Digital infrastructure for modern talent.</small>
        <em>Built with HARFT AI →</em>
      </a>
    </aside>
  );
}

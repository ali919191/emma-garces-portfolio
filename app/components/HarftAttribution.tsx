"use client";

import { analyticsEvents, trackEvent } from "../../lib/analytics";

export function HarftAttribution({ tone = "dark", compact = false }: { tone?: "dark" | "light"; compact?: boolean }) {
  const src = tone === "light" ? "/partners/harft-ai-logo-on-light.svg" : "/partners/harft-ai-logo-on-dark.svg";
  return (
    <aside className={`harft-attribution ${tone}${compact ? " top" : ""}`}>
      <a
        href="https://harftai.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={compact ? "Powered by HARFT AI" : undefined}
        onClick={() => { void trackEvent(analyticsEvents.harftOutboundClick, { destination: "harftai.com" }); }}
      >
        <img src={src} alt="" width={compact ? 90 : 180} height={compact ? 20 : 40} aria-hidden="true" />
        {compact ? (
          <span className="harft-powered">Powered by HARFT AI</span>
        ) : (
          <>
            <span>Digital Experience by HARFT AI</span>
            <small>Digital infrastructure for modern talent.</small>
            <em>Built with HARFT AI →</em>
          </>
        )}
      </a>
    </aside>
  );
}

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
        aria-label={compact ? "Powered by Intelligence" : undefined}
        onClick={() => { void trackEvent(analyticsEvents.harftOutboundClick, { destination: "harftai.com" }); }}
      >
        {compact ? (
          <>
            <span className="harft-mark">
              <img src={src} alt="" width={90} height={20} aria-hidden="true" />
            </span>
            <span className="harft-powered">Powered by Intelligence</span>
          </>
        ) : (
          <>
            <img src={src} alt="" width={180} height={40} aria-hidden="true" />
            <span>Digital Experience by HARFT AI</span>
            <small>Digital infrastructure for modern talent.</small>
            <em>Built with HARFT AI →</em>
          </>
        )}
      </a>
    </aside>
  );
}

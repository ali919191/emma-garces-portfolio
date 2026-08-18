"use client";

import { instagramHandle } from "../../lib/portfolio";
import { analyticsEvents, trackEvent } from "../../lib/analytics";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.15-3.23 1.66-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm6.41-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z" />
    </svg>
  );
}

export function InstagramLink({
  href,
  className = "",
  onClick,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
}) {
  if (!href) return null;
  const handle = instagramHandle(href);
  return (
    <a
      className={`instagram-link ${className}`.trim()}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Instagram ${handle}`}
      onClick={() => {
        onClick?.();
        void trackEvent(analyticsEvents.socialOutboundClick, { network: "instagram" });
      }}
    >
      <InstagramIcon />
      <span>{handle}</span>
    </a>
  );
}

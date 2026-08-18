"use client";

import Link from "next/link";
import { availabilityLabels, instagramHandle, selectCompCardAssets, siteUrl, type PortfolioData } from "../../lib/portfolio";
import { analyticsEvents, trackEvent } from "../../lib/analytics";

export function DigitalCompCard({ data, preview = false }: { data: PortfolioData; preview?: boolean }) {
  const { primary, supporting } = selectCompCardAssets(data.media, data.settings);
  const p = data.profile;
  const stats = [
    ["Height", p.height],
    ["Bust", p.bust],
    ["Waist", p.waist],
    ["Hips", p.hips],
    ["Dress", p.dressSize],
    ["Shoe", p.shoeSize],
    ["Hair", p.hair],
    ["Eyes", p.eyes],
  ].filter(([, value]) => value);
  const location = [p.city, p.country].filter(Boolean).join(", ");
  const website = p.website || siteUrl();

  return (
    <div className={`digital-comp ${preview ? "comp-preview" : ""}`}>
      {!preview && (
        <header className="comp-toolbar no-print">
          <Link href="/">← Portfolio</Link>
          <div>
            <a className="button ghost" href="/book" onClick={() => { void trackEvent(analyticsEvents.bookingCtaClick, { location: "comp-card" }); }}>Book Emma</a>
            <button className="button dark" onClick={() => { void trackEvent(analyticsEvents.compCardDownload); window.print(); }}>Download Comp Card</button>
          </div>
        </header>
      )}
      <article className="comp-screen">
        <figure className="comp-hero">
          {primary ? <img src={primary.url} alt={primary.caption || `${p.professionalName || p.fullName} headshot`} style={{ objectPosition: primary.focalPoint }} /> : <div className="hero-monogram" aria-hidden="true">E<span>G</span></div>}
        </figure>
        <div className="comp-copy">
          <p>Digital Comp Card</p>
          <h1>{p.professionalName || p.fullName}</h1>
          <span>International Runway Model</span>
          {location && <small>{location}</small>}
          {data.settings.availabilityStatus && <small>{availabilityLabels[data.settings.availabilityStatus]}</small>}
          {stats.length > 0 && (
            <dl>
              {stats.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          )}
          <div className="comp-contact">
            {p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}
            {p.instagram && <a href={p.instagram} target="_blank" rel="noopener noreferrer">{instagramHandle(p.instagram)}</a>}
            <a href={website} target="_blank" rel="noopener noreferrer">{website.replace(/^https?:\/\//, "")}</a>
          </div>
        </div>
      </article>
      {supporting.length > 0 && (
        <section className="comp-support">
          {supporting.map((asset) => (
            <img key={asset.id} src={asset.url} alt={asset.caption || `${asset.category} portfolio photograph`} style={{ objectPosition: asset.focalPoint }} />
          ))}
        </section>
      )}
    </div>
  );
}

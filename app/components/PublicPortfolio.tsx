"use client";

import { useEffect, useMemo, useState } from "react";
import { creditHasShowPage, publicAssetSrc, storyParagraphs, findStorySection, videoPosterSrc, type MediaAsset, type PortfolioData, type Video } from "../../lib/portfolio";
import { BeyondTheRunway, CareerTimeline, ExperienceStrip, HerStory, InternationalDirection, ProfessionalApproach, SelectedDesigners, SelectedWork } from "./StorySections";
import { analyticsEvents, trackEvent } from "../../lib/analytics";
import { HarftAttribution } from "./HarftAttribution";
import { InstagramLink } from "./InstagramLink";

const groups = ["runway", "editorial", "beauty", "digitals"] as const;

function AssetImage({ asset, className = "", priority = false }: { asset: MediaAsset; className?: string; priority?: boolean }) {
  return <img className={className} src={publicAssetSrc(asset)} alt={asset.caption || `${asset.category} portfolio photograph`} style={{ objectPosition: asset.focalPoint }} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} />;
}

export function PublicPortfolio({ initialData }: { initialData: PortfolioData }) {
  const data = initialData;
  const [menuOpen, setMenuOpen] = useState(false);

  const publicMedia = useMemo(() => data.media.filter((asset) => asset.public), [data.media]);
  const hero = publicMedia.find((asset) => asset.id === data.settings.heroMediaId) ?? publicMedia.find((asset) => asset.featured);
  const publicCredits = data.credits.filter((credit) => credit.public && credit.priority !== "hidden");
  // The primary reel leads, the rest follow in library order. Every clip renders as
  // the same kind of card — none of them becomes a section backdrop.
  const publicVideos = data.videos.filter((video) => video.public);
  const reels = [...publicVideos].sort((a, b) => Number(b.primary) - Number(a.primary));
  const p = data.profile;
  const heroStat = data.story.flatMap((section) => section.content.stats)[0];
  const about = findStorySection(data.story, "about-emma");
  const aboutParagraphs = about ? storyParagraphs(about.content.body) : [];

  // Section numbers are assigned to the sections that actually render, so the
  // editorial "01 / …" rhythm stays contiguous as story content is published.
  const journey = findStorySection(data.story, "modeling-journey");
  const archive = findStorySection(data.story, "selected-archive");
  const designerSection = findStorySection(data.story, "designers");
  const visible = [
    heroStat ? "experience" : "",
    "profile",
    archive && archive.content.mediaIds.length ? "selected-work" : "",
    journey && (journey.content.body.trim() || journey.content.mediaIds.length) ? "story" : "",
    "runway",
    ...groups.slice(1),
    "video",
    "credits",
    designerSection && (designerSection.content.creditIds.length || designerSection.content.facts.some((f) => f.kind === "designer")) ? "designers" : "",
    journey && journey.content.facts.some((f) => f.kind === "milestone" || f.kind === "show" || f.kind === "location") ? "career" : "",
    findStorySection(data.story, "beyond-the-runway") ? "beyond" : "",
    findStorySection(data.story, "professional-approach") ? "approach" : "",
    findStorySection(data.story, "dubai") ?? findStorySection(data.story, "international-availability") ? "international" : "",
    "availability",
  ].filter(Boolean);
  const idx = (key: string) => String(visible.indexOf(key) + 1).padStart(2, "0");

  const hasStory = data.story.length > 0;
  const navItems = ["Profile", ...(hasStory ? ["Story"] : []), "Runway", ...(hasStory ? ["Career"] : []), "Editorial", "Beauty", "Digitals", "Video", "Credits", "Contact"];

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => { void trackEvent(analyticsEvents.portfolioView); }, []);

  return (
    <main className="public-site">
      <header className={`public-header ${menuOpen ? "menu-open" : ""}`}>
        <a className="wordmark" href="#home" aria-label="Emma Garces home">EG<span>.</span></a>
        <div className="header-end">
          <button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="portfolio-nav">Menu</button>
          <nav id="portfolio-nav" className={menuOpen ? "public-nav open" : "public-nav"} aria-label="Portfolio navigation">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={closeMenu}>{item}</a>
            ))}
            <a href="/book" onClick={() => { closeMenu(); void trackEvent(analyticsEvents.bookingCtaClick, { location: "nav" }); }}>Book</a>
            {p.instagram && <InstagramLink href={p.instagram} className="nav-instagram" onClick={closeMenu} />}
          </nav>
        </div>
      </header>

      <section id="home" className={`hero ${hero ? "has-image" : "editorial-placeholder"}`}>
        {hero ? <AssetImage asset={hero} className="hero-image" priority /> : <div className="hero-monogram" aria-hidden="true">E<span>G</span></div>}
        <div className="hero-shade" />
        <HarftAttribution compact tone="light" />
        <div className="hero-copy">
          <p className="eyebrow">Portfolio · 2026</p>
          <h1>{p.professionalName || p.fullName || "Emma Garces"}</h1>
          <p className="hero-role">International Runway Model</p>
          {data.settings.baseLine && <p className="hero-location">{data.settings.baseLine}</p>}
          {heroStat && <p className="hero-stat">{heroStat.value} <span>{heroStat.label}</span></p>}
          <div className="hero-actions">
            <a href="/book" onClick={() => { void trackEvent(analyticsEvents.bookingCtaClick, { location: "hero" }); }}>Book Emma</a>
            <a href="/comp-card">View Comp Card</a>
          </div>
        </div>
        <a className="hero-scroll" href="#profile">View portfolio <span>↓</span></a>
      </section>

      <ExperienceStrip story={data.story} index={idx("experience")} />

      <section id="profile" className="profile-section section-pad">
        <div>
          <p className="section-index">{idx("profile")} / Profile</p>
          <h2>Presence.<br />Precision.<br /><em>Movement.</em></h2>
        </div>
        <div className="profile-copy">
          {aboutParagraphs.length ? aboutParagraphs.map((paragraph, i) => <p className="bio" key={i}>{paragraph}</p>) : p.bio ? <p className="bio">{p.bio}</p> : <p className="bio quiet">Professional profile statement to be added by Emma.</p>}
          <div className="stats-grid">
            {p.visibility.age && p.age && <div><span>Age</span><strong>{p.age}</strong></div>}
            {p.visibility.location && (p.city || p.country) && <div><span>Based</span><strong>{[p.city, p.country].filter(Boolean).join(", ")}</strong></div>}
            {p.visibility.measurements && p.height && <div><span>Height</span><strong>{p.height}</strong></div>}
            {p.visibility.measurements && p.bust && <div><span>Bust</span><strong>{p.bust}</strong></div>}
            {p.visibility.measurements && p.waist && <div><span>Waist</span><strong>{p.waist}</strong></div>}
            {p.visibility.measurements && p.hips && <div><span>Hips</span><strong>{p.hips}</strong></div>}
            {p.visibility.measurements && p.shoeSize && <div><span>Shoe</span><strong>{p.shoeSize}</strong></div>}
            {p.visibility.measurements && p.hair && <div><span>Hair</span><strong>{p.hair}</strong></div>}
            {p.visibility.measurements && p.eyes && <div><span>Eyes</span><strong>{p.eyes}</strong></div>}
          </div>
        </div>
      </section>

      <SelectedWork data={data} index={idx("selected-work")} />

      <HerStory data={data} index={idx("story")} />

      <section id="runway" className="dark-section section-pad">
        <div className="section-heading light">
          <p className="section-index">{idx("runway")} / Runway</p>
          <h2>On the runway</h2>
          <p>Selected fashion-week and designer presentations.</p>
        </div>
        <MediaMosaic assets={publicMedia.filter((asset) => asset.category === "runway")} emptyLabel="Runway selections are currently in curation." gallery="runway" />
      </section>

      {groups.slice(1).map((group, index) => {
        const assets = publicMedia.filter((asset) => asset.category === group);
        return (
          <section id={group} className={`gallery-section section-pad ${index % 2 ? "soft" : ""}`} key={group}>
            <div className="section-heading">
              <p className="section-index">{idx(group)} / {group}</p>
              <h2>{group === "digitals" ? "Digitals / Polaroids" : group}</h2>
            </div>
            <MediaMosaic assets={assets} emptyLabel={`${group[0].toUpperCase()}${group.slice(1)} selections are currently in curation.`} gallery={group} />
          </section>
        );
      })}

      <section id="video" className="video-section section-pad">
        <div className="section-heading light">
          <p className="section-index">{idx("video")} / Motion</p>
          <h2>Runway reel</h2>
        </div>
        {reels.length ? <ReelGrid videos={reels} /> : <div className="video-empty"><span>RUNWAY / MOTION</span><p>Primary runway reel coming soon.</p></div>}
      </section>

      <section id="credits" className="credits-section section-pad">
        <div className="section-heading"><p className="section-index">{idx("credits")} / Credits</p><h2>Selected runway</h2></div>
        {publicCredits.length ? (
          <div className="credits-list">
            {publicCredits.map((credit, index) => {
              // Only a credit that actually has photography or footage becomes a
              // link. Everything else stays a plain row, so there are no dead ends.
              const hasShow = creditHasShowPage(credit, publicMedia, data.videos.filter((video) => video.public));
              return (
                <article key={credit.id} className={hasShow ? "has-show" : ""}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{credit.designer || "Designer to be confirmed"}</h3>
                    <p>{[credit.event, credit.showName].filter(Boolean).join(" · ")}</p>
                    {hasShow && <a className="show-link" href={`/shows/${credit.id}`}>View show <span aria-hidden="true">→</span></a>}
                  </div>
                  <p>{[credit.city, credit.country, credit.year].filter(Boolean).join(", ")}</p>
                </article>
              );
            })}
          </div>
        ) : <p className="empty-copy">Verified runway credits will appear here after Emma adds the designer and show details.</p>}
      </section>

      <SelectedDesigners data={data} index={idx("designers")} />

      <CareerTimeline data={data} index={idx("career")} />

      <BeyondTheRunway data={data} index={idx("beyond")} />

      <ProfessionalApproach data={data} index={idx("approach")} />

      <InternationalDirection data={data} index={idx("international")} />

      <section className="availability section-pad">
        <p className="section-index">{idx("availability")} / Availability</p>
        <h2>{data.settings.availabilityStatus === "limited" ? <>Limited<br /><em>availability.</em></> : data.settings.availabilityStatus === "unavailable" ? <>Currently<br /><em>unavailable.</em></> : <>Available for<br /><em>bookings.</em></>}</h2>
        <p className="availability-note">
          {[data.settings.primaryMarket && `Primary market: ${data.settings.primaryMarket}`, data.settings.travelAvailable ? "Available to travel" : "", data.settings.additionalMarkets && `Also: ${data.settings.additionalMarkets}`, data.settings.availabilityNote].filter(Boolean).join(" · ")}
        </p>
        <div className="service-line">{data.settings.selectedServices.map((service) => <span key={service}>{service}</span>)}</div>
      </section>

      <footer id="contact" className="contact-section section-pad">
        <p className="section-index light-index">Bookings &amp; enquiries</p>
        <h2>Let’s work<br />together.</h2>
        <div className="contact-links">
          <a href="/book" onClick={() => { void trackEvent(analyticsEvents.bookingCtaClick, { location: "contact" }); }}>Book Emma</a>
          <a href="/comp-card">View Comp Card</a>
          {p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}
          {p.instagram && <InstagramLink href={p.instagram} />}
          {p.tiktok && <a href={p.tiktok} target="_blank" rel="noopener noreferrer" onClick={() => { void trackEvent(analyticsEvents.socialOutboundClick, { network: "tiktok" }); }}>TikTok ↗</a>}
          {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" onClick={() => { void trackEvent(analyticsEvents.socialOutboundClick, { network: "website" }); }}>{p.website.replace(/^https?:\/\//, "")} ↗</a>}
          {p.agency && <span>{p.agency}</span>}
        </div>
        <HarftAttribution />
        <div className="footer-line"><span>© {new Date().getFullYear()} {p.professionalName || p.fullName}</span><a href="/studio">Portfolio studio</a></div>
      </footer>
    </main>
  );
}

function MediaMosaic({ assets, emptyLabel, gallery }: { assets: MediaAsset[]; emptyLabel: string; gallery?: string }) {
  useEffect(() => {
    if (gallery && assets.length) trackEvent(analyticsEvents.galleryView, { gallery });
  }, [assets.length, gallery]);
  if (!assets.length) return <div className="gallery-empty"><span>IMAGE SELECTION</span><p>{emptyLabel}</p></div>;
  // Every tile renders at the image's own aspect ratio: a portrait stays portrait, a
  // landscape stays landscape, and nothing is cropped to fit a grid cell. The column
  // count adapts to how many images a gallery actually holds.
  return (
    <div className={`media-mosaic count-${Math.min(assets.length, 5)}`}>
      {assets.map((asset) => (
        <figure key={asset.id}>
          <AssetImage asset={asset} />
          {(asset.caption || asset.photographer) && <figcaption><span>{asset.caption}</span><span>{asset.photographer ? `Photo · ${asset.photographer}` : ""}</span></figcaption>}
        </figure>
      ))}
    </div>
  );
}

/**
 * Runway footage is shot vertically on a phone. Each clip gets its own 9:16 card in a
 * plain grid — no absolute positioning, no full-bleed frame, no autoplay, and nothing
 * that could read as a section background. `preload="none"` keeps the page cheap; the
 * poster frame beside each clip in the blob store gives the card something to show.
 */
export function ReelGrid({ videos }: { videos: Video[] }) {
  return (
    <div className={`reel-grid count-${Math.min(videos.length, 4)}`}>
      {videos.map((video) => {
        const poster = videoPosterSrc(video.url);
        return (
          <figure key={video.id}>
            {/\.(mp4|webm)(\?|$)/i.test(video.url)
              ? <video controls playsInline preload="none" poster={poster || undefined} src={video.url} />
              : <a className="reel-link" href={video.url} target="_blank" rel="noreferrer">Play footage <span aria-hidden="true">↗</span></a>}
            {(video.label || video.designer || video.year) && (
              <figcaption><span>{video.label || video.designer}</span><span>{video.year}</span></figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}

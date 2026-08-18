"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultPortfolio, instagramHandle, type MediaAsset, type PortfolioData } from "../../lib/portfolio";

const groups = ["runway", "editorial", "beauty", "digitals"] as const;

function AssetImage({ asset, className = "" }: { asset: MediaAsset; className?: string }) {
  return <img className={className} src={asset.url} alt={asset.caption || `${asset.category} portfolio photograph`} style={{ objectPosition: asset.focalPoint }} />;
}

export function PublicPortfolio() {
  const [data, setData] = useState<PortfolioData>(defaultPortfolio);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => setData(payload.portfolio))
      .finally(() => setLoading(false));
  }, []);

  const publicMedia = useMemo(() => data.media.filter((asset) => asset.public), [data.media]);
  const hero = publicMedia.find((asset) => asset.id === data.settings.heroMediaId) ?? publicMedia.find((asset) => asset.featured);
  const publicCredits = data.credits.filter((credit) => credit.public && credit.priority !== "hidden");
  const primaryVideo = data.videos.find((video) => video.primary && video.public) ?? data.videos.find((video) => video.public);
  const p = data.profile;

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className={`public-site ${loading ? "is-loading" : ""}`}>
      <header className="public-header">
        <a className="wordmark" href="#home" aria-label="Emma Garces home">EG<span>.</span></a>
        <button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>Menu</button>
        <nav className={menuOpen ? "public-nav open" : "public-nav"} aria-label="Portfolio navigation">
          {["Profile", "Runway", "Editorial", "Beauty", "Digitals", "Video", "Credits", "Contact"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={closeMenu}>{item}</a>
          ))}
        </nav>
      </header>

      <section id="home" className={`hero ${hero ? "has-image" : "editorial-placeholder"}`}>
        {hero ? <AssetImage asset={hero} className="hero-image" /> : <div className="hero-monogram" aria-hidden="true">E<span>G</span></div>}
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow">Portfolio · 2026</p>
          <h1>{p.professionalName || p.fullName || "Emma Garces"}</h1>
          <p className="hero-role">International Runway Model</p>
          {data.settings.baseLine && <p className="hero-location">{data.settings.baseLine}</p>}
        </div>
        <a className="hero-scroll" href="#profile">View portfolio <span>↓</span></a>
      </section>

      <section id="profile" className="profile-section section-pad">
        <div>
          <p className="section-index">01 / Profile</p>
          <h2>Presence.<br />Precision.<br /><em>Movement.</em></h2>
        </div>
        <div className="profile-copy">
          {p.bio ? <p className="bio">{p.bio}</p> : <p className="bio quiet">Professional profile statement to be added by Emma.</p>}
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

      <section id="runway" className="dark-section section-pad">
        <div className="section-heading light">
          <p className="section-index">02 / Runway</p>
          <h2>On the runway</h2>
          <p>Selected fashion-week and designer presentations.</p>
        </div>
        <MediaMosaic assets={publicMedia.filter((asset) => asset.category === "runway")} emptyLabel="Runway selections are currently in curation." />
      </section>

      {groups.slice(1).map((group, index) => {
        const assets = publicMedia.filter((asset) => asset.category === group);
        return (
          <section id={group} className={`gallery-section section-pad ${index % 2 ? "soft" : ""}`} key={group}>
            <div className="section-heading">
              <p className="section-index">0{index + 3} / {group}</p>
              <h2>{group === "digitals" ? "Digitals / Polaroids" : group}</h2>
            </div>
            <MediaMosaic assets={assets} emptyLabel={`${group[0].toUpperCase()}${group.slice(1)} selections are currently in curation.`} />
          </section>
        );
      })}

      <section id="video" className="video-section section-pad">
        <div className="section-heading light">
          <p className="section-index">06 / Motion</p>
          <h2>Runway reel</h2>
        </div>
        {primaryVideo ? (
          <div className="video-frame">
            {primaryVideo.url.match(/\.(mp4|webm)(\?|$)/i) ? <video controls playsInline src={primaryVideo.url} /> : <a href={primaryVideo.url} target="_blank" rel="noreferrer">Play primary runway reel <span>↗</span></a>}
          </div>
        ) : <div className="video-empty"><span>RUNWAY / MOTION</span><p>Primary runway reel coming soon.</p></div>}
      </section>

      <section id="credits" className="credits-section section-pad">
        <div className="section-heading"><p className="section-index">07 / Credits</p><h2>Selected runway</h2></div>
        {publicCredits.length ? (
          <div className="credits-list">
            {publicCredits.map((credit, index) => (
              <article key={credit.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{credit.designer || "Designer to be confirmed"}</h3><p>{[credit.event, credit.showName].filter(Boolean).join(" · ")}</p></div>
                <p>{[credit.city, credit.country, credit.year].filter(Boolean).join(", ")}</p>
              </article>
            ))}
          </div>
        ) : <p className="empty-copy">Verified runway credits will appear here after Emma adds the designer and show details.</p>}
      </section>

      <section className="availability section-pad">
        <p className="section-index">08 / Availability</p>
        <h2>Available for<br /><em>international bookings.</em></h2>
        <div className="service-line">{data.settings.selectedServices.map((service) => <span key={service}>{service}</span>)}</div>
      </section>

      <footer id="contact" className="contact-section section-pad">
        <p className="section-index light-index">Bookings &amp; enquiries</p>
        <h2>Let’s work<br />together.</h2>
        <div className="contact-links">
          {p.visibility.email && p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}
          {p.visibility.instagram && p.instagram && <a href={p.instagram} target="_blank" rel="noreferrer">{instagramHandle(p.instagram)} ↗</a>}
          {p.visibility.agency && p.agency && <span>{p.agency}</span>}
        </div>
        <div className="footer-line"><span>© {new Date().getFullYear()} {p.professionalName || p.fullName}</span><a href="/studio">Portfolio studio</a></div>
      </footer>
    </main>
  );
}

function MediaMosaic({ assets, emptyLabel }: { assets: MediaAsset[]; emptyLabel: string }) {
  if (!assets.length) return <div className="gallery-empty"><span>IMAGE SELECTION</span><p>{emptyLabel}</p></div>;
  return (
    <div className={`media-mosaic count-${Math.min(assets.length, 5)}`}>
      {assets.map((asset, index) => (
        <figure key={asset.id} className={index % 5 === 0 ? "portrait-lead" : ""}>
          <AssetImage asset={asset} />
          {(asset.caption || asset.photographer) && <figcaption><span>{asset.caption}</span><span>{asset.photographer ? `Photo · ${asset.photographer}` : ""}</span></figcaption>}
        </figure>
      ))}
    </div>
  );
}

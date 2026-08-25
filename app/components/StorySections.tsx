"use client";

/**
 * Phase 3 — Living Biography public sections.
 *
 * Every section here renders ONLY from `PortfolioData.story`, i.e. the `content_sections`
 * rows Emma approves in Studio. No biography text is hardcoded. Each section returns null
 * when its content is absent, so the public site degrades to exactly what it renders today
 * until Emma publishes the corresponding section.
 *
 * On public routes the data has already passed through `toPublicPortfolio()`, so a private
 * section never arrives here and a public section's media/video/credit references have
 * already been filtered down to public records.
 */

import {
  findStorySection,
  publicStoryStats,
  storyParagraphs,
  storySectionCredits,
  storySectionMedia,
  publicAssetSrc,
  type Credit,
  type MediaAsset,
  type PortfolioData,
  type StoryFact,
  type StorySection,
} from "../../lib/portfolio";

function Figure({ asset, className = "" }: { asset: MediaAsset; className?: string }) {
  return (
    <figure className={className}>
      <img
        src={publicAssetSrc(asset)}
        alt={asset.caption || `${asset.category} photograph of Emma Garces`}
        style={{ objectPosition: asset.focalPoint }}
        loading="lazy"
      />
      {(asset.caption || asset.designer) && (
        <figcaption>
          <span>{asset.caption}</span>
          <span>{asset.designer}</span>
        </figcaption>
      )}
    </figure>
  );
}

/* ─────────────────────────── A · Experience strip ─────────────────────────── */

export function ExperienceStrip({ story, index }: { story: StorySection[]; index: string }) {
  const stats = publicStoryStats(story);
  if (!stats.length) return null;
  return (
    <section id="experience" className="experience-strip section-pad" aria-label="Career at a glance">
      <p className="section-index">{index} / Experience</p>
      <div className="experience-grid">
        {stats.map((stat) => (
          <div key={stat.id}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── D · Selected work ─────────────────────────── */

export function SelectedWork({ data, index }: { data: PortfolioData; index: string }) {
  const section = findStorySection(data.story, "selected-archive");
  const assets = storySectionMedia(section, data.media).slice(0, 12);
  if (!assets.length) return null;
  return (
    <section id="selected-work" className="selected-work section-pad">
      <div className="section-heading">
        <p className="section-index">{index} / Selected work</p>
        <h2>{section?.title && section.title !== "Selected Archive" ? section.title : "Selected work"}</h2>
        {section?.content.summary && <p>{section.content.summary}</p>}
      </div>
      <div className="work-grid">
        {assets.map((asset, i) => (
          <Figure key={asset.id} asset={asset} className={i % 5 === 0 ? "wide" : ""} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── C · Her story ─────────────────────────── */

export function HerStory({ data, index }: { data: PortfolioData; index: string }) {
  const section = findStorySection(data.story, "modeling-journey");
  if (!section) return null;
  const paragraphs = storyParagraphs(section.content.body);
  const assets = storySectionMedia(section, data.media);
  if (!paragraphs.length && !assets.length) return null;

  return (
    <section id="story" className="her-story dark-section section-pad">
      <div className="section-heading light">
        <p className="section-index">{index} / Her story</p>
        <h2>{section.title || "Her story"}</h2>
        {section.content.summary && <p>{section.content.summary}</p>}
      </div>
      <div className="story-flow">
        {paragraphs.map((paragraph, i) => (
          <div className={assets[i] ? "story-beat" : "story-beat solo"} key={i}>
            <p>{paragraph}</p>
            {assets[i] && <Figure asset={assets[i]} />}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── G · Career timeline ─────────────────────────── */

const timelineKinds = new Set(["milestone", "show", "location"]);

export function CareerTimeline({ data, index }: { data: PortfolioData; index: string }) {
  const section = findStorySection(data.story, "modeling-journey");
  const entries = (section?.content.facts ?? []).filter((fact) => timelineKinds.has(fact.kind));
  if (!entries.length) return null;

  return (
    <section id="career" className="career-timeline section-pad">
      <div className="section-heading">
        <p className="section-index">{index} / Career</p>
        <h2>Eighteen years,<br /><em>in order.</em></h2>
      </div>
      <ol className="timeline">
        {entries.map((entry: StoryFact) => (
          <li key={entry.id}>
            <span className="timeline-year">{entry.year}</span>
            <div className="timeline-body">
              <h3>{entry.label}</h3>
              {entry.value && <p>{entry.value}</p>}
            </div>
            {entry.location && <span className="timeline-place">{entry.location}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ─────────────────────────── F · Selected designers & shows ─────────────────────────── */

export function SelectedDesigners({ data, index }: { data: PortfolioData; index: string }) {
  const section = findStorySection(data.story, "designers");
  if (!section) return null;
  const credits = storySectionCredits(section, data.credits);
  const assets = storySectionMedia(section, data.media);
  const named = section.content.facts.filter((fact) => fact.kind === "designer");
  if (!credits.length && !named.length) return null;

  const byCredit = new Map<string, MediaAsset[]>();
  for (const asset of assets) {
    const key = asset.designer || asset.event;
    if (!key) continue;
    byCredit.set(key, [...(byCredit.get(key) ?? []), asset]);
  }

  return (
    <section id="designers" className="selected-designers section-pad soft">
      <div className="section-heading">
        <p className="section-index">{index} / Selected designers</p>
        <h2>{section.title || "Selected designers"}</h2>
        {section.content.summary && <p>{section.content.summary}</p>}
      </div>
      <div className="designer-grid">
        {(credits.length ? credits : named).map((entry) => {
          const isCredit = (entry as Credit).designer !== undefined && (entry as Credit).event !== undefined;
          const credit = entry as Credit;
          const fact = entry as StoryFact;
          const title = isCredit ? credit.designer || credit.event : fact.label;
          const meta = isCredit
            ? [credit.showName || credit.event, credit.city, credit.year].filter(Boolean).join(" · ")
            : [fact.value, fact.location, fact.year].filter(Boolean).join(" · ");
          const cover = byCredit.get(title)?.[0];
          return (
            <article key={entry.id}>
              {cover ? <Figure asset={cover} /> : <div className="designer-mark" aria-hidden="true">{title.slice(0, 2).toUpperCase()}</div>}
              <h3>{title}</h3>
              {meta && <p>{meta}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────── H · Beyond the runway ─────────────────────────── */

export function BeyondTheRunway({ data, index }: { data: PortfolioData; index: string }) {
  const section = findStorySection(data.story, "beyond-the-runway");
  if (!section) return null;
  const paragraphs = storyParagraphs(section.content.body);
  const credentials = section.content.facts.filter((fact) => fact.kind === "education" || fact.kind === "business" || fact.kind === "technology");
  if (!paragraphs.length && !credentials.length) return null;

  return (
    <section id="beyond" className="beyond-runway section-pad">
      <div>
        <p className="section-index">{index} / Beyond the runway</p>
        <h2>{section.title || "Beyond the runway"}</h2>
      </div>
      <div className="beyond-copy">
        {paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        {credentials.length > 0 && (
          <dl className="credential-list">
            {credentials.map((fact) => (
              <div key={fact.id}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────── I · Professional approach ─────────────────────────── */

export function ProfessionalApproach({ data, index }: { data: PortfolioData; index: string }) {
  const section = findStorySection(data.story, "professional-approach");
  if (!section) return null;
  const paragraphs = storyParagraphs(section.content.body);
  if (!paragraphs.length && !section.content.summary) return null;

  return (
    <section id="approach" className="approach dark-section section-pad">
      <div className="section-heading light">
        <p className="section-index">{index} / Approach</p>
        <h2>{section.title || "Professional approach"}</h2>
      </div>
      {section.content.summary && <blockquote className="approach-quote">{section.content.summary}</blockquote>}
      <div className="approach-copy">
        {paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </div>
    </section>
  );
}

/* ─────────────────────────── J · International / Dubai ─────────────────────────── */

export function InternationalDirection({ data, index }: { data: PortfolioData; index: string }) {
  const section = findStorySection(data.story, "dubai") ?? findStorySection(data.story, "international-availability");
  if (!section) return null;
  const paragraphs = storyParagraphs(section.content.body);
  const markets = section.content.facts.filter((fact) => fact.kind === "location" || fact.kind === "goal");
  const assets = storySectionMedia(section, data.media).slice(0, 2);
  if (!paragraphs.length && !markets.length) return null;

  return (
    <section id="international" className="international section-pad soft">
      <div className="section-heading">
        <p className="section-index">{index} / International</p>
        <h2>{section.title || "International"}</h2>
        {section.content.summary && <p>{section.content.summary}</p>}
      </div>
      <div className="international-body">
        <div className="international-copy">
          {paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
          {markets.length > 0 && (
            <ol className="market-path">
              {markets.map((fact) => (
                <li key={fact.id}>
                  <strong>{fact.label}</strong>
                  {fact.value && <span>{fact.value}</span>}
                </li>
              ))}
            </ol>
          )}
        </div>
        {assets.length > 0 && (
          <div className="international-media">
            {assets.map((asset) => <Figure key={asset.id} asset={asset} />)}
          </div>
        )}
      </div>
    </section>
  );
}

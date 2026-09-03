import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readPortfolio } from "../../../db/portfolio-repository";
import {
  creditHeadline,
  creditMedia,
  creditMeta,
  creditVideos,
  publicAssetSrc,
  siteUrl,
  toPublicPortfolio,
  type Credit,
  type MediaAsset,
  type PortfolioData,
  type Video,
} from "../../../lib/portfolio";
import { HarftAttribution } from "../../components/HarftAttribution";

export const dynamic = "force-dynamic";

/**
 * A single show. Reached only from a runway credit that actually has media or
 * video attached, so this route never renders an empty shell: a credit without
 * assets is not linked on the homepage and 404s here.
 */
type Resolved = { data: PortfolioData; credit: Credit; assets: MediaAsset[]; videos: Video[] };

async function resolveShow(id: string): Promise<Resolved | null> {
  const data = toPublicPortfolio(await readPortfolio());
  const credit = data.credits.find((item) => item.id === id);
  if (!credit) return null;
  const assets = creditMedia(credit, data.media);
  const videos = creditVideos(credit, data.videos);
  if (!assets.length && !videos.length) return null;
  return { data, credit, assets, videos };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const show = await resolveShow((await params).id);
  if (!show) return { title: "Show not found — Emma Garces" };
  const headline = creditHeadline(show.credit);
  const meta = creditMeta(show.credit).join(" · ");
  const title = `${headline} — Emma Garces`;
  const description = `Emma Garces for ${headline}. ${meta}`.trim();
  return {
    title,
    description,
    alternates: { canonical: `/shows/${show.credit.id}` },
    openGraph: { title, description, url: `${siteUrl()}/shows/${show.credit.id}`, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ShowPage({ params }: { params: Promise<{ id: string }> }) {
  const show = await resolveShow((await params).id);
  if (!show) notFound();
  const { credit, assets, videos } = show;
  const headline = creditHeadline(credit);
  const meta = creditMeta(credit);

  return (
    <main className="show-page">
      <header className="platform-top">
        <Link className="wordmark" href="/" aria-label="Emma Garces home">EG<span>.</span></Link>
        <Link href="/#credits">← Back to selected runway</Link>
      </header>

      <section className="show-intro">
        <p className="section-index">Show</p>
        <h1>{headline}</h1>
        {meta.length > 0 && (
          <ul className="show-meta">
            {meta.map((part) => <li key={part}>{part}</li>)}
          </ul>
        )}
      </section>

      {videos.length > 0 && (
        <section className="show-motion" aria-label="Show video">
          {videos.map((video) => (
            <figure className="video-frame" key={video.id}>
              {/\.(mp4|webm)(\?|$)/i.test(video.url)
                ? <video controls playsInline preload="metadata" src={video.url} />
                : <a href={video.url} target="_blank" rel="noreferrer">Play show footage <span>↗</span></a>}
            </figure>
          ))}
        </section>
      )}

      {assets.length > 0 && (
        <section className="show-gallery" aria-label="Show photography">
          {assets.map((asset, index) => (
            <figure key={asset.id}>
              <img
                src={publicAssetSrc(asset)}
                alt={asset.caption || `${headline} — photograph of Emma Garces`}
                style={{ objectPosition: asset.focalPoint }}
                loading={index === 0 ? "eager" : "lazy"}
              />
              {(asset.caption || asset.photographer) && (
                <figcaption>
                  <span>{asset.caption}</span>
                  <span>{asset.photographer ? `Photo · ${asset.photographer}` : ""}</span>
                </figcaption>
              )}
            </figure>
          ))}
        </section>
      )}

      <nav className="show-footer" aria-label="Return to portfolio">
        <Link href="/#credits">← Back to selected runway</Link>
        <Link href="/book">Book Emma</Link>
      </nav>
      <HarftAttribution tone="light" />
    </main>
  );
}

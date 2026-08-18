"use client";

import { useMemo, useState } from "react";
import { instagramHandle, portfolioWarnings, selectCompCardAssets, type MediaAsset, type PortfolioData } from "../../lib/portfolio";

export type ExportType = "portfolio" | "comp-card" | "credits" | "digitals" | "dubai";

const titles: Record<ExportType, string> = {
  portfolio: "Portfolio PDF",
  "comp-card": "Comp Card",
  credits: "Runway Credits",
  digitals: "Digital Package",
  dubai: "Dubai Model Submission",
};

export function ExportView({ initialData, initialType = "portfolio" }: { initialData: PortfolioData; initialType?: ExportType }) {
  const data = initialData;
  const [type, setType] = useState<ExportType>(initialType);

  const warnings = useMemo(() => portfolioWarnings(data), [data]);

  return (
    <main className="export-shell">
      <header className="export-toolbar no-print"><div><a href="/studio">← Studio</a><span>{titles[type]}</span></div><div><select value={type} onChange={(event) => setType(event.target.value as ExportType)}>{Object.entries(titles).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select><button className="button dark" onClick={() => window.print()}>Print / Save PDF</button></div></header>
      {warnings.length > 0 && <div className="export-notice no-print"><b>Draft export</b><span>{warnings.length} readiness note{warnings.length === 1 ? "" : "s"}. Incomplete fields will not be invented.</span></div>}
      {type === "comp-card" && <CompCard data={data} />}
      {type === "credits" && <CreditsSheet data={data} />}
      {type === "digitals" && <DigitalsPackage data={data} />}
      {type === "dubai" && <PortfolioBook data={data} dubai />}
      {type === "portfolio" && <PortfolioBook data={data} />}
    </main>
  );
}

function ImageOrPlaceholder({ asset, label, className = "" }: { asset?: MediaAsset; label: string; className?: string }) {
  return asset ? <img className={className} src={asset.url} alt={asset.caption || label} style={{ objectPosition: asset.focalPoint }} /> : <div className={`print-placeholder ${className}`}><span>EG</span><p>{label}</p></div>;
}

function Cover({ data, dubai = false }: { data: PortfolioData; dubai?: boolean }) {
  const hero = data.media.find((asset) => asset.id === data.settings.heroMediaId) ?? data.media.find((asset) => asset.featured);
  return <section className="print-page print-cover"><ImageOrPlaceholder asset={hero} label="Primary portfolio image" /><div className="print-cover-overlay" /><div className="print-cover-copy"><p>{dubai ? "Dubai Model Submission" : "International Portfolio"}</p><h1>{data.profile.professionalName || data.profile.fullName}</h1><span>International Runway Model</span><small>{data.settings.baseLine}</small></div></section>;
}

function ProfilePage({ data }: { data: PortfolioData }) {
  const p = data.profile;
  const stats = [["Height", p.height], ["Bust", p.bust], ["Waist", p.waist], ["Hips", p.hips], ["Dress", p.dressSize], ["Shoe", p.shoeSize], ["Hair", p.hair], ["Eyes", p.eyes]].filter(([, value]) => value);
  return <section className="print-page print-profile"><header><p>Profile / 02</p><h2>Emma<br /><em>Garces.</em></h2></header><div className="print-profile-body"><p>{p.bio || "Professional profile statement to be provided by Emma."}</p><div className="print-stats">{stats.length ? stats.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>) : <p>Approved measurements to be added.</p>}</div><div className="print-services">{data.settings.selectedServices.map((service) => <span key={service}>{service}</span>)}</div></div></section>;
}

function CreditsPage({ data, compact = false }: { data: PortfolioData; compact?: boolean }) {
  const credits = data.credits.filter((credit) => credit.priority !== "hidden" && credit.verified);
  return <section className="print-page print-credits"><header><p>Experience / {compact ? "03" : "01"}</p><h2>Selected<br />runway.</h2></header>{credits.length ? <div className="print-credit-list">{credits.map((credit, index) => <article key={credit.id}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{credit.designer}</h3><p>{[credit.event, credit.showName].filter(Boolean).join(" · ")}</p>{credit.designerBase && <small>{credit.designerBase}{credit.notes ? ` · ${credit.notes}` : ""}</small>}</div><b>{[credit.city, credit.country, credit.year].filter(Boolean).join(" / ")}</b></article>)}</div> : <div className="print-empty"><p>Verified runway credits will populate this sheet after Emma enters exact designer and show details.</p></div>}</section>;
}

function ImagePage({ asset, index, label }: { asset: MediaAsset; index: number; label: string }) {
  return <section className="print-page print-image-page"><img src={asset.url} alt={asset.caption || label} style={{ objectPosition: asset.focalPoint }} /><footer><span>{String(index).padStart(2, "0")} / {label}</span><p>{asset.caption}{asset.photographer ? ` · Photo: ${asset.photographer}` : ""}</p></footer></section>;
}

function ContactPage({ data, dubai = false }: { data: PortfolioData; dubai?: boolean }) {
  const p = data.profile;
  return <section className="print-page print-contact"><p>{dubai ? "Dubai / International Bookings" : "Bookings & Enquiries"}</p><h2>Available<br />internationally.</h2><div>{p.email && <span>{p.email}</span>}{p.instagram && <span>{instagramHandle(p.instagram)}</span>}{p.agency && <span>{p.agency}</span>}</div><footer><b>{p.professionalName || p.fullName}</b><span>International Runway Model</span></footer></section>;
}

function PortfolioBook({ data, dubai = false }: { data: PortfolioData; dubai?: boolean }) {
  const featured = data.media.filter((asset) => asset.featured && asset.public);
  const selected = (dubai ? [...featured.filter((asset) => asset.category === "runway"), ...featured.filter((asset) => asset.category === "editorial"), ...data.media.filter((asset) => asset.category === "digitals" && asset.public)] : data.media.filter((asset) => asset.public)).slice(0, dubai ? 8 : 11);
  return <div className="print-document"><Cover data={data} dubai={dubai} /><ProfilePage data={data} /><CreditsPage data={data} compact />{selected.map((asset, index) => <ImagePage key={asset.id} asset={asset} index={index + 4} label={asset.category} />)}<ContactPage data={data} dubai={dubai} /></div>;
}

function CompCard({ data }: { data: PortfolioData }) {
  const p = data.profile; const { primary: hero, supporting } = selectCompCardAssets(data.media, data.settings); const selected = supporting.slice(0, 8); const credits = data.credits.filter((credit) => credit.priority === "featured" && credit.verified).slice(0, 4);
  return <div className="print-document comp-document"><section className="print-page comp-front"><ImageOrPlaceholder asset={hero} label="Comp card hero image" /><div className="comp-name"><h1>{p.professionalName || p.fullName}</h1><p>International Runway Model</p></div><div className="comp-stats">{[["Height", p.height], ["Bust", p.bust], ["Waist", p.waist], ["Hips", p.hips], ["Shoe", p.shoeSize], ["Hair", p.hair], ["Eyes", p.eyes]].filter(([, v]) => v).map(([l, v]) => <span key={l}><b>{l}</b>{v}</span>)}</div></section><section className="print-page comp-back"><header><h2>{p.professionalName || p.fullName}</h2><p>Selected portfolio</p></header><div className="comp-grid">{Array.from({ length: 8 }).map((_, index) => <ImageOrPlaceholder key={index} asset={selected[index]} label={`Selected image ${index + 1}`} />)}</div><div className="comp-credit-row">{credits.map((credit) => <span key={credit.id}>{credit.designer} · {credit.event}</span>)}</div><footer><span>{p.email || "Book Emma at emmagarces.com/book"}</span><span>{p.instagram ? instagramHandle(p.instagram) : ""}</span></footer></section></div>;
}

function CreditsSheet({ data }: { data: PortfolioData }) { return <div className="print-document"><CreditsPage data={data} /><ContactPage data={data} /></div>; }

function DigitalsPackage({ data }: { data: PortfolioData }) {
  const digitals = data.media.filter((asset) => asset.category === "digitals" && asset.public);
  return <div className="print-document"><section className="print-page digitals-page"><header><p>Digitals / Natural</p><h1>{data.profile.professionalName || data.profile.fullName}</h1></header><div className="digitals-grid">{Array.from({ length: 6 }).map((_, index) => <ImageOrPlaceholder key={index} asset={digitals[index]} label={["Front headshot", "Profile", "Full-body front", "Full-body side", "Full-body back", "Additional natural"][index]} />)}</div><footer><span>Unretouched digitals</span><span>{data.profile.height || "Measurements to be added"}</span></footer></section><ContactPage data={data} /></div>;
}

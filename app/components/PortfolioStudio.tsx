"use client";

import { upload as uploadBlob } from "@vercel/blob/client";
import { useMemo, useRef, useState } from "react";
import {
  availabilityLabels,
  emptyStoryContent,
  mergeStoryCatalog,
  nextHeroMediaId,
  portfolioWarnings,
  serviceOptions,
  storyFactKinds,
  storySectionIsEmpty,
  type AvailabilityStatus,
  type Credit,
  type MediaAsset,
  type MediaCategory,
  type PortfolioData,
  type Profile,
  type StoryFact,
  type StoryFactKind,
  type StoryStat,
  type StorySection,
  type StorySectionContent,
  type Video,
  type VisibilityKey,
} from "../../lib/portfolio";
import { inquiryStatuses, type BookingInquiry, type InquiryStatus } from "../../lib/inquiries";
import { DigitalCompCard } from "./DigitalCompCard";

type StudioSection = "overview" | "inquiries" | "profile" | "measurements" | "credits" | "story" | "media" | "videos" | "comp-card" | "settings" | "exports";

const sections: { id: StudioSection; label: string; marker: string }[] = [
  { id: "overview", label: "Overview", marker: "01" },
  { id: "profile", label: "Profile", marker: "02" },
  { id: "measurements", label: "Measurements", marker: "03" },
  { id: "credits", label: "Runway credits", marker: "04" },
  { id: "story", label: "Story & career", marker: "05" },
  { id: "media", label: "Media library", marker: "06" },
  { id: "videos", label: "Runway video", marker: "07" },
  { id: "comp-card", label: "Comp card", marker: "08" },
  { id: "settings", label: "Portfolio settings", marker: "09" },
  { id: "inquiries", label: "Inquiries", marker: "10" },
  { id: "exports", label: "Export studio", marker: "11" },
];

const mediaCategories: MediaCategory[] = ["runway", "editorial", "beauty", "digitals", "headshot", "full-body", "campaign", "lookbook", "behind-the-scenes"];

export function PortfolioStudio({ initialData, initialInquiries = [] }: { initialData: PortfolioData; initialInquiries?: BookingInquiry[] }) {
  const [section, setSection] = useState<StudioSection>("overview");
  const [data, setData] = useState<PortfolioData>(initialData);
  const [inquiries, setInquiries] = useState<BookingInquiry[]>(initialInquiries);
  const [status, setStatus] = useState("Draft loaded");
  const [mobileNav, setMobileNav] = useState(false);

  const warnings = useMemo(() => portfolioWarnings(data), [data]);

  async function save(publish = false) {
    setStatus(publish ? "Publishing…" : "Saving…");
    const next = publish ? { ...data, settings: { ...data.settings, lastPublishedAt: new Date().toISOString() } } : data;
    const response = await fetch("/api/portfolio", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(next) });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setStatus(payload.error || "Could not save");
      return;
    }
    setData(next);
    setStatus(publish ? "Published just now" : "Saved just now");
  }

  return (
    <main className="studio-shell">
      <aside className={mobileNav ? "studio-sidebar open" : "studio-sidebar"}>
        <div className="studio-brand"><span>EG</span><div>Portfolio<br />Studio</div></div>
        <nav aria-label="Studio sections">
          {sections.map((item) => (
            <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => { setSection(item.id); setMobileNav(false); }}>
              <span>{item.marker}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer"><span className="status-dot" />{status}</div>
      </aside>

      <div className="studio-main">
        <header className="studio-topbar">
          <button className="studio-menu" onClick={() => setMobileNav(!mobileNav)}>Sections</button>
          <p>Emma Garces / International Portfolio</p>
          <div>
            <a className="button ghost" href="/" target="_blank">Preview</a>
            <button className="button dark" onClick={() => save(true)}>Publish</button>
          </div>
        </header>
        <div className="studio-content">
          <>
              {section === "overview" && <Overview data={data} warnings={warnings} inquiries={inquiries} navigate={setSection} />}
              {section === "profile" && <ProfileEditor data={data} setData={setData} />}
              {section === "measurements" && <MeasurementsEditor data={data} setData={setData} />}
              {section === "credits" && <CreditsEditor data={data} setData={setData} />}
              {section === "story" && <StoryEditor data={data} setData={setData} />}
              {section === "media" && <MediaEditor data={data} setData={setData} />}
              {section === "videos" && <VideosEditor data={data} setData={setData} />}
              {section === "comp-card" && <CompCardEditor data={data} setData={setData} />}
              {section === "settings" && <SettingsEditor data={data} setData={setData} />}
              {section === "inquiries" && <InquiriesEditor inquiries={inquiries} setInquiries={setInquiries} />}
              {section === "exports" && <ExportsPanel warnings={warnings} />}
              {section !== "overview" && section !== "exports" && section !== "inquiries" && (
                <div className="save-bar"><span>{status}</span><button className="button dark" onClick={() => save(false)}>Save draft</button></div>
              )}
          </>
        </div>
      </div>
    </main>
  );
}

function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className="editor-heading"><p>{eyebrow}</p><h1>{title}</h1><span>{copy}</span></div>;
}

function Overview({ data, warnings, inquiries, navigate }: { data: PortfolioData; warnings: string[]; inquiries: BookingInquiry[]; navigate: (section: StudioSection) => void }) {
  const completed = [Boolean(data.settings.heroMediaId), data.credits.length > 0, data.media.length >= 4, Boolean(data.profile.email || data.profile.instagram), Boolean(data.profile.height)].filter(Boolean).length;
  const newCount = inquiries.filter((inquiry) => inquiry.status === "new").length;
  return (
    <div>
      <SectionIntro eyebrow="Portfolio readiness" title={`Good morning, ${data.profile.professionalName.split(" ")[0] || "Emma"}.`} copy="Complete the essentials first. Your public portfolio stays elegant while unfinished sections remain hidden." />
      <div className="overview-grid">
        <article className="readiness-card"><div className="progress-ring" style={{ "--progress": `${completed * 20}%` } as React.CSSProperties}><strong>{completed * 20}%</strong><span>ready</span></div><div><p>International package</p><h2>{completed < 5 ? "In curation" : "Ready to submit"}</h2><span>{5 - completed} essential item{5 - completed === 1 ? "" : "s"} remaining</span></div></article>
        <article className="preview-card"><div><p>Public portfolio</p><h2>{data.profile.professionalName}</h2><span>{availabilityLabels[data.settings.availabilityStatus]}</span></div><a href="/" target="_blank">Open preview ↗</a></article>
      </div>
      <div className="overview-columns">
        <section className="panel"><div className="panel-title"><h2>Attention needed</h2><span>{warnings.length}</span></div>{warnings.length ? <div className="warning-list">{warnings.map((warning) => <button key={warning} onClick={() => navigate(warning.includes("image") ? "media" : warning.includes("credit") || warning.includes("NYFW") ? "credits" : "profile")}><i>!</i><span>{warning}</span><b>→</b></button>)}</div> : <p className="success-note">All essential portfolio checks pass.</p>}</section>
        <section className="panel quick-actions"><div className="panel-title"><h2>Next moves</h2></div><button onClick={() => navigate("inquiries")}><span>{newCount} new booking inquir{newCount === 1 ? "y" : "ies"}</span><b>→</b></button><button onClick={() => navigate("media")}><span>Upload portfolio images</span><b>→</b></button><button onClick={() => navigate("comp-card")}><span>Review digital comp card</span><b>→</b></button></section>
      </div>
      <p className="analytics-note">Page-view and outbound click metrics live in the Vercel Analytics dashboard. Studio shows booking inquiries stored in PostgreSQL, without copying visitor analytics into a second database.</p>
    </div>
  );
}

function ProfileEditor({ data, setData }: EditorProps) {
  const update = (key: keyof Profile, value: string) => setData({ ...data, profile: { ...data.profile, [key]: value } });
  const toggle = (key: VisibilityKey) => setData({ ...data, profile: { ...data.profile, visibility: { ...data.profile.visibility, [key]: !data.profile.visibility[key] } } });
  return (
    <div>
      <SectionIntro eyebrow="Identity & contact" title="Model profile" copy="Enter only information you are comfortable storing. Use the visibility controls to decide what appears publicly." />
      <div className="form-panel">
        <div className="form-grid two"><Field label="Full name" value={data.profile.fullName} onChange={(v) => update("fullName", v)} required /><Field label="Professional / model name" value={data.profile.professionalName} onChange={(v) => update("professionalName", v)} /><Field label="Age" value={data.profile.age} onChange={(v) => update("age", v)} placeholder="Optional" /><VisibilityToggle label="Show age publicly" checked={data.profile.visibility.age} onChange={() => toggle("age")} /><Field label="Current city" value={data.profile.city} onChange={(v) => update("city", v)} placeholder="Add city" /><Field label="Country" value={data.profile.country} onChange={(v) => update("country", v)} placeholder="Add country" /><Field label="Booking email" value={data.profile.email} onChange={(v) => update("email", v)} type="email" placeholder="Add professional email" /><Field label="Phone" value={data.profile.phone} onChange={(v) => update("phone", v)} placeholder="Optional" /><Field label="Instagram" value={data.profile.instagram} onChange={(v) => update("instagram", v)} type="url" /><Field label="TikTok" value={data.profile.tiktok} onChange={(v) => update("tiktok", v)} type="url" placeholder="Optional" /><Field label="Website" value={data.profile.website} onChange={(v) => update("website", v)} type="url" placeholder="Optional" /><Field label="Agency" value={data.profile.agency} onChange={(v) => update("agency", v)} placeholder="If represented" /><Field label="Booking contact" value={data.profile.bookingContact} onChange={(v) => update("bookingContact", v)} placeholder="Name or management contact" /><Field label="Languages" value={data.profile.languages} onChange={(v) => update("languages", v)} placeholder="Comma separated" /></div>
        <label className="field full"><span>Professional introduction</span><textarea value={data.profile.bio} onChange={(event) => update("bio", event.target.value)} placeholder="Write a concise, factual professional introduction in your own voice." rows={5} /><small>No exaggerated claims are generated automatically.</small></label>
        <div className="visibility-box"><h3>Public display</h3><div>{(["location", "email", "phone", "instagram", "tiktok", "website", "agency", "languages", "availability"] as VisibilityKey[]).map((key) => <VisibilityToggle key={key} label={`Show ${key}`} checked={Boolean(data.profile.visibility[key])} onChange={() => toggle(key)} />)}</div></div>
      </div>
    </div>
  );
}

function MeasurementsEditor({ data, setData }: EditorProps) {
  const update = (key: keyof Profile, value: string) => setData({ ...data, profile: { ...data.profile, [key]: value } });
  const measurementFields: [keyof Profile, string, string][] = [["height", "Height", "e.g. 5′10″ / 178 cm"], ["bust", "Bust", "e.g. 34 in / 86 cm"], ["waist", "Waist", "e.g. 25 in / 64 cm"], ["hips", "Hips", "e.g. 36 in / 91 cm"], ["dressSize", "Dress size", "US / EU / UK"], ["shoeSize", "Shoe size", "US / EU / UK"], ["hair", "Hair color", "Add hair color"], ["eyes", "Eye color", "Add eye color"], ["ethnicity", "Ethnicity", "Optional — only if you choose"], ["citizenship", "Passport / citizenship", "Keep private unless appropriate"], ["travelAvailability", "Travel availability", "e.g. Available with notice"], ["workAuthorization", "Work authorization", "Only where appropriate"]];
  return (
    <div><SectionIntro eyebrow="Statistics" title="Measurements & availability" copy="Use one unit system consistently. These fields stay private unless you explicitly enable public display." /><div className="form-panel"><div className="form-grid three">{measurementFields.map(([key, label, placeholder]) => <Field key={key} label={label} value={String(data.profile[key])} onChange={(v) => update(key, v)} placeholder={placeholder} />)}</div><VisibilityToggle label="Display approved measurements on the public portfolio" checked={data.profile.visibility.measurements} onChange={() => setData({ ...data, profile: { ...data.profile, visibility: { ...data.profile.visibility, measurements: !data.profile.visibility.measurements } } })} /></div></div>
  );
}

type EditorProps = { data: PortfolioData; setData: React.Dispatch<React.SetStateAction<PortfolioData>> };

function CreditsEditor({ data, setData }: EditorProps) {
  const add = () => {
    const credit: Credit = { id: crypto.randomUUID(), event: "", designer: "", showName: "", city: "", country: "", year: "", venue: "", notes: "", designerBase: "", priority: "standard", verified: false, public: false };
    setData({ ...data, credits: [...data.credits, credit] });
  };
  const update = (id: string, patch: Partial<Credit>) => setData({ ...data, credits: data.credits.map((credit) => credit.id === id ? { ...credit, ...patch } : credit) });
  const move = (index: number, direction: -1 | 1) => { const next = [...data.credits]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; setData({ ...data, credits: next }); };
  return (
    <div><SectionIntro eyebrow="Verified experience" title="Runway credits" copy="Enter each presentation exactly as it occurred. A Dubai-based designer shown in the USA should be identified in those precise terms." /><div className="editor-actions"><p>{data.credits.length} credit{data.credits.length === 1 ? "" : "s"}</p><button className="button dark" onClick={add}>+ Add runway credit</button></div>{!data.credits.length && <EmptyState title="No credits entered" copy="Add New York Fashion Week and other runway credits once the designer and show details are ready." action="Add first credit" onAction={add} />}{data.credits.map((credit, index) => <article className="credit-editor" key={credit.id}><div className="credit-editor-head"><span>Runway credit {String(index + 1).padStart(2, "0")}</span><div><button onClick={() => move(index, -1)} aria-label="Move credit up">↑</button><button onClick={() => move(index, 1)} aria-label="Move credit down">↓</button><button onClick={() => setData({ ...data, credits: data.credits.filter((item) => item.id !== credit.id) })}>Remove</button></div></div><div className="form-grid three"><Field label="Fashion week / event" value={credit.event} onChange={(v) => update(credit.id, { event: v })} placeholder="Exact event name" /><Field label="Designer" value={credit.designer} onChange={(v) => update(credit.id, { designer: v })} placeholder="Designer name" /><Field label="Show name" value={credit.showName} onChange={(v) => update(credit.id, { showName: v })} placeholder="Exact show title" /><Field label="City" value={credit.city} onChange={(v) => update(credit.id, { city: v })} /><Field label="Country" value={credit.country} onChange={(v) => update(credit.id, { country: v })} /><Field label="Date / year" value={credit.year} onChange={(v) => update(credit.id, { year: v })} /><Field label="Venue" value={credit.venue} onChange={(v) => update(credit.id, { venue: v })} placeholder="Optional" /><Field label="Designer base" value={credit.designerBase} onChange={(v) => update(credit.id, { designerBase: v })} placeholder="e.g. Dubai-based designer" /><label className="field"><span>Priority</span><select value={credit.priority} onChange={(event) => update(credit.id, { priority: event.target.value as Credit["priority"] })}><option value="featured">Featured</option><option value="standard">Standard</option><option value="hidden">Hidden</option></select></label></div><label className="field full"><span>Accuracy notes</span><textarea rows={2} value={credit.notes} onChange={(event) => update(credit.id, { notes: event.target.value })} placeholder="Example: Dubai-based designer; USA runway presentation." /></label><div className="inline-toggles"><VisibilityToggle label="Verified by Emma" checked={credit.verified} onChange={() => update(credit.id, { verified: !credit.verified })} /><VisibilityToggle label="Display publicly" checked={credit.public} onChange={() => update(credit.id, { public: !credit.public })} /></div></article>)}</div>
  );
}

const factKindLabels: Record<StoryFactKind, string> = {
  milestone: "Milestone",
  designer: "Designer",
  show: "Show / event",
  location: "City / country",
  education: "Education",
  business: "Business",
  technology: "Technology / AI",
  award: "Award",
  goal: "Future goal",
  note: "Note",
};

function StoryEditor({ data, setData }: EditorProps) {
  const catalog = useMemo(() => mergeStoryCatalog(data.story), [data.story]);
  const [openSlug, setOpenSlug] = useState(catalog[0]?.slug ?? "");
  const active = catalog.find((section) => section.slug === openSlug) ?? catalog[0];

  const writeSection = (slug: string, patch: Partial<StorySection>) =>
    setData({ ...data, story: catalog.map((section) => (section.slug === slug ? { ...section, ...patch } : section)) });
  const writeContent = (slug: string, patch: Partial<StorySectionContent>) => {
    const current = catalog.find((section) => section.slug === slug);
    if (!current) return;
    writeSection(slug, { content: { ...current.content, ...patch } });
  };

  if (!active) return null;
  const content = active.content;
  const toggleRef = (key: "mediaIds" | "videoIds" | "creditIds", id: string) =>
    writeContent(active.slug, { [key]: content[key].includes(id) ? content[key].filter((item) => item !== id) : [...content[key], id] } as Partial<StorySectionContent>);

  return (
    <div>
      <SectionIntro
        eyebrow="Approved knowledge"
        title="Story &amp; career"
        copy="Enter only information Emma has approved. Nothing here is generated. Sections stay private until you publish them, and referencing an image or credit never changes that record's own visibility."
      />

      <div className="editor-actions">
        <p>{catalog.filter((section) => !storySectionIsEmpty(section)).length} of {catalog.length} sections have content · {catalog.filter((section) => section.public).length} public</p>
      </div>

      <div className="form-panel">
        <label className="field"><span>Section</span>
          <select value={active.slug} onChange={(event) => setOpenSlug(event.target.value)}>
            {catalog.map((section) => (
              <option key={section.slug} value={section.slug}>
                {section.title}{storySectionIsEmpty(section) ? " — empty" : ""}{section.public ? " · public" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <article className="credit-editor">
        <div className="credit-editor-head">
          <span>{active.title}</span>
          <div><button onClick={() => writeSection(active.slug, { content: structuredClone(emptyStoryContent) })}>Clear section</button></div>
        </div>

        <div className="form-grid two">
          <Field label="Section title" value={active.title} onChange={(v) => writeSection(active.slug, { title: v })} />
          <Field label="Short summary" value={content.summary} onChange={(v) => writeContent(active.slug, { summary: v })} placeholder="One approved sentence" />
        </div>

        <label className="field full"><span>Narrative</span>
          <textarea
            rows={10}
            value={content.body}
            onChange={(event) => writeContent(active.slug, { body: event.target.value })}
            placeholder="Paste Emma's approved answer here. Separate paragraphs with a blank line."
          />
        </label>

        <div className="inline-toggles">
          <VisibilityToggle label="Publish this section" checked={active.public} onChange={() => writeSection(active.slug, { public: !active.public })} />
        </div>

        <StoryStats slug={active.slug} stats={content.stats} onChange={(stats) => writeContent(active.slug, { stats })} />

        <StoryFacts slug={active.slug} facts={content.facts} onChange={(facts) => writeContent(active.slug, { facts })} />

        <StoryReferences
          label="Associated images"
          empty="No media in the library yet."
          items={data.media.map((asset) => ({ id: asset.id, label: asset.caption || asset.filename, meta: asset.category, isPublic: asset.public, flagged: asset.minorEra }))}
          selected={content.mediaIds}
          onToggle={(id) => toggleRef("mediaIds", id)}
        />
        <StoryReferences
          label="Associated videos"
          empty="No videos added yet."
          items={data.videos.map((video) => ({ id: video.id, label: video.label || video.url || "Untitled video", meta: video.year, isPublic: video.public }))}
          selected={content.videoIds}
          onToggle={(id) => toggleRef("videoIds", id)}
        />
        <StoryReferences
          label="Associated runway credits"
          empty="No runway credits entered yet."
          items={data.credits.map((credit) => ({ id: credit.id, label: credit.designer || credit.event || "Untitled credit", meta: [credit.city, credit.year].filter(Boolean).join(" · "), isPublic: credit.public && credit.priority !== "hidden" }))}
          selected={content.creditIds}
          onToggle={(id) => toggleRef("creditIds", id)}
        />
      </article>
    </div>
  );
}

function StoryStats({ slug, stats, onChange }: { slug: string; stats: StoryStat[]; onChange: (stats: StoryStat[]) => void }) {
  const add = () => onChange([...stats, { id: crypto.randomUUID(), value: "", label: "" }]);
  const update = (id: string, patch: Partial<StoryStat>) => onChange(stats.map((stat) => (stat.id === id ? { ...stat, ...patch } : stat)));
  return (
    <div className="visibility-box">
      <h3>Experience figures</h3>
      <p className="analytics-note">Headline career numbers shown in the public experience strip, e.g. 18 / Years modeling. Up to eight. Publish this section to display them.</p>
      {!stats.length && <p className="empty-copy">No approved figures yet.</p>}
      {stats.map((stat) => (
        <div className="form-grid three" key={`${slug}-${stat.id}`}>
          <Field label="Figure" value={stat.value} onChange={(v) => update(stat.id, { value: v })} placeholder="18" />
          <Field label="Label" value={stat.label} onChange={(v) => update(stat.id, { label: v })} placeholder="Years modeling" />
          <div className="asset-actions"><button className="danger" onClick={() => onChange(stats.filter((item) => item.id !== stat.id))}>Remove</button></div>
        </div>
      ))}
      <button className="button outline" onClick={add}>+ Add figure</button>
    </div>
  );
}

function StoryFacts({ slug, facts, onChange }: { slug: string; facts: StoryFact[]; onChange: (facts: StoryFact[]) => void }) {
  const add = () => onChange([...facts, { id: crypto.randomUUID(), kind: "milestone", label: "", value: "", year: "", location: "" }]);
  const update = (id: string, patch: Partial<StoryFact>) => onChange(facts.map((fact) => (fact.id === id ? { ...fact, ...patch } : fact)));
  return (
    <div className="visibility-box">
      <h3>Structured facts</h3>
      <p className="analytics-note">Discrete, checkable facts drawn from the narrative above. Later phases read these instead of parsing prose. Leave blank if Emma has not supplied the detail.</p>
      {!facts.length && <p className="empty-copy">No approved facts yet.</p>}
      {facts.map((fact) => (
        <div className="form-grid three" key={`${slug}-${fact.id}`}>
          <label className="field"><span>Type</span>
            <select value={fact.kind} onChange={(event) => update(fact.id, { kind: event.target.value as StoryFactKind })}>
              {storyFactKinds.map((kind) => <option key={kind} value={kind}>{factKindLabels[kind]}</option>)}
            </select>
          </label>
          <Field label="Label" value={fact.label} onChange={(v) => update(fact.id, { label: v })} placeholder="e.g. New York Fashion Week" />
          <Field label="Detail" value={fact.value} onChange={(v) => update(fact.id, { value: v })} placeholder="Approved detail" />
          <Field label="Date / year" value={fact.year} onChange={(v) => update(fact.id, { year: v })} />
          <Field label="City / country" value={fact.location} onChange={(v) => update(fact.id, { location: v })} />
          <div className="asset-actions"><button className="danger" onClick={() => onChange(facts.filter((item) => item.id !== fact.id))}>Remove fact</button></div>
        </div>
      ))}
      <button className="button outline" onClick={add}>+ Add fact</button>
    </div>
  );
}

function StoryReferences({ label, empty, items, selected, onToggle }: {
  label: string;
  empty: string;
  items: { id: string; label: string; meta?: string; isPublic: boolean; flagged?: boolean }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="visibility-box">
      <h3>{label}</h3>
      {!items.length ? <p className="empty-copy">{empty}</p> : (
        <>
          <p className="analytics-note">{selected.length} selected. Private records may be associated now; they stay private and are removed from the public payload until they are published on their own record.</p>
          <div>
            {items.map((item) => (
              <VisibilityToggle
                key={item.id}
                label={`${item.label}${item.meta ? ` · ${item.meta}` : ""}${item.isPublic ? "" : " · private"}${item.flagged ? " · minor-era" : ""}`}
                checked={selected.includes(item.id)}
                onChange={() => onToggle(item.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MediaEditor({ data, setData }: EditorProps) {
  const [category, setCategory] = useState<MediaCategory>("runway");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  async function upload(files: FileList | File[]) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const blob = await uploadBlob(`portfolio/${file.name}`, file, {
          access: "private",
          handleUploadUrl: "/api/media/upload",
        });
        const key = blob.pathname;
        const asset: MediaAsset = { id: crypto.randomUUID(), key, url: `/api/media?key=${encodeURIComponent(key)}`, filename: file.name, mimeType: file.type, size: file.size, category, caption: "", photographer: "", designer: "", event: "", date: "", featured: false, public: false, minorEra: false, focalPoint: "center" };
        setData((current) => ({ ...current, media: [...current.media, asset] }));
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }
  const update = (id: string, patch: Partial<MediaAsset>) => setData({ ...data, media: data.media.map((asset) => asset.id === id ? { ...asset, ...patch } : asset) });
  async function remove(asset: MediaAsset) { const response = await fetch(`/api/media?key=${encodeURIComponent(asset.key)}`, { method: "DELETE" }); if (response.ok) setData({ ...data, media: data.media.filter((item) => item.id !== asset.id), settings: { ...data.settings, heroMediaId: data.settings.heroMediaId === asset.id ? "" : data.settings.heroMediaId } }); else window.alert("The media item could not be deleted."); }
  return (
    <div><SectionIntro eyebrow="Image-first curation" title="Media library" copy="Upload original portfolio assets, classify them, and control which images appear publicly or in submission exports." /><div className="upload-controls"><label className="field"><span>Upload category</span><select value={category} onChange={(event) => setCategory(event.target.value as MediaCategory)}>{mediaCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); upload(event.dataTransfer.files); }}><input ref={inputRef} type="file" accept="image/*,video/*" multiple onChange={(event) => event.target.files && upload(event.target.files)} /><span>{uploading ? "Uploading…" : "Drop files here or"}</span><button className="button outline" disabled={uploading} onClick={() => inputRef.current?.click()}>Choose files</button><small>JPG, PNG, WebP, MP4 · up to 50 MB each</small></div></div>{!data.media.length && <EmptyState title="Your media library is empty" copy="Begin with one strong runway hero, then add editorial, beauty, and natural digitals." action="Choose first image" onAction={() => inputRef.current?.click()} />}{data.media.length > 0 && <div className="asset-grid">{data.media.map((asset) => <article className="asset-card" key={asset.id}><div className="asset-image"><img src={asset.url} alt="" style={{ objectPosition: asset.focalPoint }} />{data.settings.heroMediaId === asset.id && <span>Hero</span>}</div><div className="asset-fields"><p>{asset.filename}</p><div className="form-grid two compact"><label className="field"><span>Category</span><select value={asset.category} onChange={(event) => update(asset.id, { category: event.target.value as MediaCategory })}>{mediaCategories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Focal point</span><select value={asset.focalPoint} onChange={(event) => update(asset.id, { focalPoint: event.target.value as MediaAsset["focalPoint"] })}><option>center</option><option>top</option><option>bottom</option></select></label><Field label="Caption" value={asset.caption} onChange={(v) => update(asset.id, { caption: v })} /><Field label="Photographer" value={asset.photographer} onChange={(v) => update(asset.id, { photographer: v })} /></div><div className="asset-actions"><button onClick={() => setData({ ...data, settings: { ...data.settings, heroMediaId: nextHeroMediaId(data.settings.heroMediaId, asset.id) } })}>{data.settings.heroMediaId === asset.id ? "Remove hero" : "Set as hero"}</button><button onClick={() => update(asset.id, { featured: !asset.featured })}>{asset.featured ? "★ Featured" : "☆ Feature"}</button><button onClick={() => update(asset.id, { public: !asset.public })}>{asset.public ? "Public" : "Private"}</button><button onClick={() => update(asset.id, { minorEra: !asset.minorEra })} title="Marks material captured while Emma was a minor. Classification only — it does not publish or hide the asset.">{asset.minorEra ? "⚠ Minor-era" : "Mark minor-era"}</button><button className="danger" onClick={() => remove(asset)}>Delete</button></div></div></article>)}</div>}</div>
  );
}

function VideosEditor({ data, setData }: EditorProps) {
  const add = () => setData({ ...data, videos: [...data.videos, { id: crypto.randomUUID(), url: "", label: "", designer: "", year: "", primary: data.videos.length === 0, public: false }] });
  const update = (id: string, patch: Partial<Video>) => setData({ ...data, videos: data.videos.map((video) => video.id === id ? { ...video, ...patch } : video) });
  return <div><SectionIntro eyebrow="Motion" title="Runway reel & video" copy="Add a primary reel and individual runway footage. Direct MP4 links play inline; hosted links open immediately." /><div className="editor-actions"><p>{data.videos.length} video{data.videos.length === 1 ? "" : "s"}</p><button className="button dark" onClick={add}>+ Add video</button></div>{!data.videos.length && <EmptyState title="No runway video added" copy="Add a link to the strongest current reel when it is ready." action="Add runway reel" onAction={add} />}{data.videos.map((video) => <article className="video-editor" key={video.id}><div className="form-grid two"><Field label="Video URL" value={video.url} onChange={(v) => update(video.id, { url: v })} type="url" placeholder="https://…" /><Field label="Label / fashion week" value={video.label} onChange={(v) => update(video.id, { label: v })} /><Field label="Designer" value={video.designer} onChange={(v) => update(video.id, { designer: v })} /><Field label="Date / year" value={video.year} onChange={(v) => update(video.id, { year: v })} /></div><div className="inline-toggles"><VisibilityToggle label="Primary reel" checked={video.primary} onChange={() => setData({ ...data, videos: data.videos.map((item) => ({ ...item, primary: item.id === video.id ? !video.primary : false })) })} /><VisibilityToggle label="Display publicly" checked={video.public} onChange={() => update(video.id, { public: !video.public })} /><button className="text-danger" onClick={() => setData({ ...data, videos: data.videos.filter((item) => item.id !== video.id) })}>Remove</button></div></article>)}</div>;
}

function SettingsEditor({ data, setData }: EditorProps) {
  const settings = data.settings;
  const patch = (next: Partial<typeof settings>) => setData({ ...data, settings: { ...settings, ...next } });
  return <div><SectionIntro eyebrow="Presentation controls" title="Portfolio settings" copy="Choose positioning, booking categories, and what is ready to share." /><div className="form-panel"><Field label="Cover supporting line" value={settings.baseLine} onChange={(v) => patch({ baseLine: v })} placeholder="USA Based | Available Internationally" /><div className="form-grid two"><label className="field"><span>Availability</span><select value={settings.availabilityStatus} onChange={(event) => patch({ availabilityStatus: event.target.value as AvailabilityStatus })}><option value="available">Available for bookings</option><option value="limited">Limited availability</option><option value="unavailable">Currently unavailable</option></select></label><Field label="Primary market" value={settings.primaryMarket} onChange={(v) => patch({ primaryMarket: v })} placeholder="e.g. New York" /><Field label="Additional markets" value={settings.additionalMarkets} onChange={(v) => patch({ additionalMarkets: v })} placeholder="Optional" /><Field label="Availability note" value={settings.availabilityNote} onChange={(v) => patch({ availabilityNote: v })} placeholder="Short public note only" /></div><VisibilityToggle label="Available to travel" checked={settings.travelAvailable} onChange={() => patch({ travelAvailable: !settings.travelAvailable })} /><div className="visibility-box"><h3>Selected booking categories</h3><div>{serviceOptions.map((service) => <VisibilityToggle key={service} label={service} checked={settings.selectedServices.includes(service)} onChange={() => patch({ selectedServices: settings.selectedServices.includes(service) ? settings.selectedServices.filter((item) => item !== service) : [...settings.selectedServices, service] })} />)}</div></div><VisibilityToggle label="Public portfolio enabled" checked={settings.publicSite} onChange={() => patch({ publicSite: !settings.publicSite })} /></div></div>;
}

function CompCardEditor({ data, setData }: EditorProps) {
  const publicMedia = data.media.filter((asset) => asset.public);
  const ids = data.settings.compCardMediaIds;
  const toggle = (id: string) => {
    const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id].slice(0, 8);
    setData({ ...data, settings: { ...data.settings, compCardMediaIds: next } });
  };
  return (
    <div>
      <SectionIntro eyebrow="Agency toolkit" title="Digital comp card" copy="Choose a primary image and up to eight supporting public images. The live card stays in sync with approved profile information." />
      <div className="form-panel">
        <label className="field"><span>Primary image</span>
          <select value={data.settings.compCardPrimaryMediaId} onChange={(event) => setData({ ...data, settings: { ...data.settings, compCardPrimaryMediaId: event.target.value } })}>
            <option value="">Use hero / featured fallback</option>
            {publicMedia.map((asset) => <option key={asset.id} value={asset.id}>{asset.filename}</option>)}
          </select>
        </label>
        <p className="analytics-note">Supporting images: {ids.length} / 8. Profile measurements and booking contacts follow the public visibility settings.</p>
      </div>
      <div className="asset-grid">
        {publicMedia.map((asset) => (
          <article className="asset-card" key={asset.id}>
            <div className="asset-image"><img src={asset.url} alt="" style={{ objectPosition: asset.focalPoint }} />{data.settings.compCardPrimaryMediaId === asset.id && <span>Primary</span>}</div>
            <div className="asset-fields">
              <p>{asset.filename}</p>
              <div className="asset-actions">
                <button onClick={() => setData({ ...data, settings: { ...data.settings, compCardPrimaryMediaId: data.settings.compCardPrimaryMediaId === asset.id ? "" : asset.id } })}>{data.settings.compCardPrimaryMediaId === asset.id ? "Remove primary" : "Set primary"}</button>
                <button onClick={() => toggle(asset.id)}>{ids.includes(asset.id) ? "Selected" : "Add supporting"}</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="comp-studio-preview"><DigitalCompCard data={data} preview /></div>
    </div>
  );
}

function InquiriesEditor({ inquiries, setInquiries }: { inquiries: BookingInquiry[]; setInquiries: React.Dispatch<React.SetStateAction<BookingInquiry[]>> }) {
  const [openId, setOpenId] = useState(inquiries[0]?.id ?? "");
  const selected = inquiries.find((inquiry) => inquiry.id === openId) ?? inquiries[0];
  async function changeStatus(id: string, status: InquiryStatus) {
    const response = await fetch(`/api/inquiries/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) {
      window.alert("The inquiry could not be updated.");
      return;
    }
    const payload = await response.json() as { inquiry: BookingInquiry };
    setInquiries((current) => current.map((item) => item.id === id ? payload.inquiry : item));
  }
  return (
    <div>
      <SectionIntro eyebrow="Bookings" title="Inquiries" copy="Triage professional booking requests. Private inquiry details never appear on the public site." />
      {!inquiries.length && <EmptyState title="No inquiries yet" copy="New Book Emma submissions will appear here." action="Open booking page" onAction={() => window.open("/book", "_blank")} />}
      {inquiries.length > 0 && (
        <div className="inquiry-layout">
          <div className="inquiry-list">
            {inquiries.map((inquiry) => (
              <button key={inquiry.id} className={selected?.id === inquiry.id ? "active" : ""} onClick={() => setOpenId(inquiry.id)}>
                <b>{inquiry.contactName}</b>
                <span>{inquiry.inquiryType} · {inquiry.status}</span>
                <small>{new Date(inquiry.createdAt).toLocaleDateString()}</small>
              </button>
            ))}
          </div>
          {selected && (
            <article className="inquiry-detail">
              <header>
                <div>
                  <p>{selected.inquiryType}</p>
                  <h2>{selected.contactName}</h2>
                  <span>{selected.company || "Independent / unspecified"}</span>
                </div>
                <label className="field"><span>Status</span>
                  <select value={selected.status} onChange={(event) => changeStatus(selected.id, event.target.value as InquiryStatus)}>
                    {inquiryStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
              </header>
              <dl>
                <div><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>
                {selected.phone && <div><dt>Phone</dt><dd>{selected.phone}</dd></div>}
                {selected.preferredContact && <div><dt>Preferred contact</dt><dd>{selected.preferredContact}</dd></div>}
                {selected.projectName && <div><dt>Project</dt><dd>{selected.projectName}</dd></div>}
                {selected.proposedDates && <div><dt>Dates</dt><dd>{selected.proposedDates}</dd></div>}
                {selected.location && <div><dt>Location</dt><dd>{selected.location}</dd></div>}
                {selected.budgetRange && <div><dt>Budget</dt><dd>{selected.budgetRange}</dd></div>}
                {selected.details && <div className="full"><dt>Details</dt><dd>{selected.details}</dd></div>}
                <div><dt>Source</dt><dd>{[selected.source, selected.referrer, selected.utmSource, selected.utmCampaign].filter(Boolean).join(" · ") || "website"}</dd></div>
              </dl>
            </article>
          )}
        </div>
      )}
    </div>
  );
}

function ExportsPanel({ warnings }: { warnings: string[] }) {
  const exports = [{ type: "portfolio", title: "Portfolio PDF", copy: "Dynamic 10–15 page editorial book; empty sections are omitted." }, { type: "comp-card", title: "One-page comp card", copy: "Agency-style front and reverse layout with selected images and statistics." }, { type: "credits", title: "Runway credits sheet", copy: "Clean, verified experience record sorted in Emma’s chosen order." }, { type: "digitals", title: "Digital package", copy: "Natural headshot, profile, and full-body image presentation." }, { type: "dubai", title: "Dubai model submission", copy: "Runway-led international package for Dubai agencies, designers, and castings." }];
  return <div><SectionIntro eyebrow="Submission suite" title="Export studio" copy="Open a print-ready preview, then use Save as PDF in the print dialog. Only completed content is included." />{warnings.length > 0 && <div className="export-warning"><b>{warnings.length} readiness note{warnings.length === 1 ? "" : "s"}</b><span>Exports remain available, but review the Overview before sending.</span></div>}<div className="export-grid">{exports.map((item) => <article key={item.type} className={item.type === "dubai" ? "featured-export" : ""}><span>{item.type === "dubai" ? "International" : "Document"}</span><h2>{item.title}</h2><p>{item.copy}</p><a className="button outline" href={`/exports?type=${item.type}`} target="_blank" rel="noreferrer">Open print preview ↗</a></article>)}</div></div>;
}

function Field({ label, value, onChange, placeholder = "", type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="field"><span>{label}{required && <b> *</b>}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function VisibilityToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label className="toggle"><input type="checkbox" checked={checked} onChange={onChange} /><span aria-hidden="true" /><b>{label}</b></label>;
}

function EmptyState({ title, copy, action, onAction }: { title: string; copy: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><span>EG</span><h2>{title}</h2><p>{copy}</p><button className="button outline" onClick={onAction}>{action}</button></div>;
}

import { describe, expect, it } from "vitest";
import {
  creditDateValue,
  creditHasShowPage,
  creditMedia,
  creditMeta,
  creditVideos,
  creditsWithShowPages,
  curateHomepage,
  normalizeStoryContent,
  defaultPortfolio,
  sortCreditsNewestFirst,
  toPublicPortfolio,
  type Credit,
  type MediaAsset,
  type PortfolioData,
  type Video,
} from "../lib/portfolio";

function credit(id: string, overrides: Partial<Credit> = {}): Credit {
  return {
    id, event: "", designer: "", showName: "", city: "", country: "", year: "",
    venue: "", notes: "", designerBase: "", priority: "standard", verified: true, public: true,
    ...overrides,
  };
}

function asset(id: string, overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id, key: `${id}.jpg`, url: `/${id}`, filename: `${id}.jpg`, category: "runway",
    caption: "", photographer: "", designer: "", event: "", date: "",
    featured: false, public: true, minorEra: false, focalPoint: "center", ...overrides,
  };
}

function video(id: string, overrides: Partial<Video> = {}): Video {
  return { id, url: `https://example.com/${id}.mp4`, label: "", designer: "", year: "", primary: false, public: true, ...overrides };
}

describe("credit chronology", () => {
  it("reads a month and year, a full date, and a bare year", () => {
    expect(creditDateValue("September 2021")).toBe(20210915);
    expect(creditDateValue("July 25, 2026")).toBe(20260725);
    expect(creditDateValue("2015")).toBe(20150715);
  });

  it("resolves an approximate range to its latest year", () => {
    expect(creditDateValue("~2018–2020")).toBe(20200715);
    expect(creditDateValue("2021–2023")).toBe(20230715);
  });

  it("never throws and sorts unparseable dates last", () => {
    expect(creditDateValue("")).toBe(0);
    expect(creditDateValue("to be confirmed")).toBe(0);
    expect(creditDateValue(undefined as unknown as string)).toBe(0);
  });

  it("orders newest first and keeps entry order for ties", () => {
    const ordered = sortCreditsNewestFirst([
      credit("old", { year: "~2008" }),
      credit("newest", { year: "August 2026" }),
      credit("tie-a", { year: "June 2025" }),
      credit("tie-b", { year: "June 2025" }),
      credit("unknown", { year: "" }),
      credit("mid", { year: "September 2021" }),
    ]);
    expect(ordered.map((item) => item.id)).toEqual(["newest", "tie-a", "tie-b", "mid", "old", "unknown"]);
  });

  it("puts an August show ahead of a July show in the same year", () => {
    const ordered = sortCreditsNewestFirst([credit("july", { year: "July 25, 2026" }), credit("august", { year: "August 2026" })]);
    expect(ordered[0].id).toBe("august");
  });

  it("orders the public credit list without touching Studio's own order", () => {
    const source = structuredClone(defaultPortfolio);
    source.credits = [credit("older", { year: "September 2021" }), credit("newer", { year: "June 2025" })];
    expect(toPublicPortfolio(source).credits.map((item) => item.id)).toEqual(["newer", "older"]);
    expect(source.credits.map((item) => item.id)).toEqual(["older", "newer"]);
  });
});

describe("credit to media association", () => {
  const nyfw = credit("nyfw-2021", { designer: "Negris LeBrum", event: "New York Fashion Week", year: "September 2021" });
  const media = [
    asset("match", { designer: "Negris LeBrum", event: "New York Fashion Week", date: "September 2021" }),
    asset("wrong-season", { designer: "Negris LeBrum", event: "New York Fashion Week", date: "February 2023" }),
    asset("wrong-designer", { designer: "Larita Fashion", event: "New York Fashion Week", date: "September 2021" }),
    asset("unlabelled"),
  ];

  it("joins on designer, event and date together", () => {
    expect(creditMedia(nyfw, media).map((item) => item.id)).toEqual(["match"]);
  });

  it("tolerates casing, spacing and curly apostrophes", () => {
    const messy = credit("x", { designer: "David’s Bridal", event: "Bridal  Presentation", year: "2015" });
    const shot = asset("shot", { designer: "david's bridal", event: "Bridal Presentation", date: " 2015 " });
    expect(creditMedia(messy, [shot]).map((item) => item.id)).toEqual(["shot"]);
  });

  it("never links a credit that is missing designer, event or date", () => {
    expect(creditMedia(credit("bare", { designer: "Negris LeBrum" }), media)).toEqual([]);
  });

  it("joins video on designer and year, since videos carry no event", () => {
    const videos = [video("v-match", { designer: "Negris LeBrum", year: "September 2021" }), video("v-other", { designer: "Larita Fashion", year: "April 2025" })];
    expect(creditVideos(nyfw, videos).map((item) => item.id)).toEqual(["v-match"]);
  });

  it("earns a show page from either photography or footage, and never from neither", () => {
    expect(creditHasShowPage(nyfw, media, [])).toBe(true);
    expect(creditHasShowPage(nyfw, [], [video("v", { designer: "Negris LeBrum", year: "September 2021" })])).toBe(true);
    expect(creditHasShowPage(credit("empty", { designer: "Nobody", event: "Nowhere", year: "2030" }), media, [])).toBe(false);
  });

  it("lists linkable credits newest first and skips hidden or private ones", () => {
    const source: PortfolioData = {
      ...structuredClone(defaultPortfolio),
      media: [
        asset("a", { designer: "D", event: "E", date: "June 2025" }),
        asset("b", { designer: "D", event: "E", date: "September 2021" }),
        asset("c", { designer: "D", event: "E", date: "March 2020" }),
      ],
      credits: [
        credit("older", { designer: "D", event: "E", year: "September 2021" }),
        credit("newer", { designer: "D", event: "E", year: "June 2025" }),
        credit("hidden", { designer: "D", event: "E", year: "March 2020", priority: "hidden" }),
        credit("no-media", { designer: "D", event: "E", year: "January 2019" }),
      ],
    };
    expect(creditsWithShowPages(source).map((item) => item.id)).toEqual(["newer", "older"]);
  });

  it("does not expose a private asset through a show page", () => {
    const source: PortfolioData = {
      ...structuredClone(defaultPortfolio),
      media: [asset("private-shot", { public: false, designer: "D", event: "E", date: "June 2025" })],
      credits: [credit("show", { designer: "D", event: "E", year: "June 2025" })],
    };
    const publicData = toPublicPortfolio(source);
    expect(creditsWithShowPages(publicData)).toEqual([]);
    expect(creditMedia(publicData.credits[0], publicData.media)).toEqual([]);
  });

  it("builds a readable meta line and drops empty parts", () => {
    expect(creditMeta(credit("m", { event: "New York Fashion Week", showName: "", city: "New York", country: "USA", year: "September 2021" })))
      .toEqual(["New York Fashion Week", "New York, USA", "September 2021"]);
  });
});

describe("the media gateway serves runway footage too", () => {
  it("keeps a video's URL valid even though it is a gateway path, not a blob URL", async () => {
    const { isValidUrl, mediaUrl } = await import("../lib/portfolio");
    expect(isValidUrl(mediaUrl("portfolio/video/2026/grid.mp4"))).toBe(true);
    expect(isValidUrl("https://example.com/a.mp4")).toBe(true);
    expect(isValidUrl("//evil.example/a.mp4")).toBe(false);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("")).toBe(true);
  });

  it("resolves a video by its gateway URL and still refuses a private one to the public", async () => {
    const { savePortfolio, findServableMedia } = await import("../db/portfolio-repository");
    const { defaultPortfolio, mediaUrl } = await import("../lib/portfolio");
    const { vi } = await import("vitest");
    vi.stubEnv("PORTFOLIO_DEMO_MODE", "true");
    vi.stubEnv("NODE_ENV", "test");
    const key = "portfolio/video/2026/grid.mp4";
    const edited = structuredClone(defaultPortfolio);
    edited.videos = [
      { id: "v-public", url: mediaUrl(key), label: "", designer: "", year: "", primary: true, public: true },
      { id: "v-private", url: mediaUrl("portfolio/video/2026/draft.mp4"), label: "", designer: "", year: "", primary: false, public: false },
    ];
    await savePortfolio(edited);
    expect(await findServableMedia(key)).toEqual({ isPublic: true });
    expect(await findServableMedia("portfolio/video/2026/draft.mp4")).toEqual({ isPublic: false });
    expect(await findServableMedia("portfolio/video/2026/nothing.mp4")).toBeNull();
    vi.unstubAllEnvs();
  });
});

describe("cover resolution and focal points", () => {
  it("normalizes an unknown focal point instead of letting it reach CSS", async () => {
    const { normalizeFocalPoint } = await import("../lib/portfolio");
    expect(normalizeFocalPoint("left")).toBe("left");
    expect(normalizeFocalPoint("right")).toBe("right");
    expect(normalizeFocalPoint("top")).toBe("top");
    expect(normalizeFocalPoint("diagonal")).toBe("center");
    expect(normalizeFocalPoint(undefined)).toBe("center");
    expect(normalizeFocalPoint(7)).toBe("center");
  });

  it("picks a designer cover from the whole library, featured first, and never a private one", async () => {
    const { designerCoverAsset } = await import("../lib/portfolio");
    const library = [
      asset("plain", { designer: "Negris LeBrum" }),
      asset("star", { designer: "negris  lebrum", featured: true }),
      asset("private-star", { designer: "Negris LeBrum", featured: true, public: false }),
      asset("other", { designer: "Larita Fashion", featured: true }),
    ];
    expect(designerCoverAsset("Negris LeBrum", library)?.id).toBe("star");
    expect(designerCoverAsset("Larita Fashion", library)?.id).toBe("other");
    expect(designerCoverAsset("Poshak Fashion", library)).toBeUndefined();
    expect(designerCoverAsset("", library)).toBeUndefined();
    expect(designerCoverAsset("Negris LeBrum", [library[2]])).toBeUndefined();
  });

  it("derives a poster path from a gateway video URL and refuses anything else", async () => {
    const { videoPosterSrc, designerVideoPoster, mediaUrl } = await import("../lib/portfolio");
    const url = mediaUrl("portfolio/video/2026/larita-2025.mp4");
    expect(videoPosterSrc(url)).toBe(mediaUrl("portfolio/video/2026/larita-2025.jpg"));
    expect(videoPosterSrc("https://example.com/a.mp4")).toBe("");
    expect(videoPosterSrc(mediaUrl("portfolio/2026/npn-01.jpg"))).toBe("");
    const videos = [
      video("v1", { url, designer: "Larita Fashion", public: true }),
      video("v2", { url: mediaUrl("portfolio/video/2026/secret.mp4"), designer: "Poshak Fashion", public: false }),
    ];
    expect(designerVideoPoster("larita fashion", videos)).toContain("larita-2025.jpg");
    expect(designerVideoPoster("Poshak Fashion", videos)).toBe("");
    expect(designerVideoPoster("Nobody", videos)).toBe("");
  });

  it("serves a poster only as public as the clip it belongs to", async () => {
    const { savePortfolio, findServableMedia } = await import("../db/portfolio-repository");
    const { defaultPortfolio, mediaUrl } = await import("../lib/portfolio");
    const { vi } = await import("vitest");
    vi.stubEnv("PORTFOLIO_DEMO_MODE", "true");
    vi.stubEnv("NODE_ENV", "test");
    const edited = structuredClone(defaultPortfolio);
    edited.videos = [
      video("open", { url: mediaUrl("portfolio/video/2026/open.mp4"), public: true }),
      video("shut", { url: mediaUrl("portfolio/video/2026/shut.mp4"), public: false }),
    ];
    await savePortfolio(edited);
    expect(await findServableMedia("portfolio/video/2026/open.jpg")).toEqual({ isPublic: true });
    expect(await findServableMedia("portfolio/video/2026/shut.jpg")).toEqual({ isPublic: false });
    expect(await findServableMedia("portfolio/video/2026/ghost.jpg")).toBeNull();
    vi.unstubAllEnvs();
  });
});

describe("homepage curation", () => {
  const specs = [
    { key: "runway", categories: ["runway" as const], limit: 8, maxPerShoot: 2 },
    { key: "editorial", categories: ["editorial" as const], limit: 4, maxPerShoot: 2 },
  ];

  function library(): PortfolioData {
    const shot = (id: string, over: Partial<MediaAsset>) => asset(id, over);
    const source = structuredClone(defaultPortfolio);
    source.media = [
      shot("hero", { category: "runway", designer: "D", event: "Show", date: "2025", caption: "Hero look" }),
      shot("r-a1", { category: "runway", designer: "A", event: "A show", date: "2024", caption: "A look" }),
      shot("r-a2", { category: "runway", designer: "A", event: "A show", date: "2024", caption: "A look" }),
      shot("r-a3", { category: "runway", designer: "A", event: "A show", date: "2024", caption: "A look" }),
      shot("r-b1", { category: "runway", designer: "B", event: "B show", date: "2023", caption: "B look" }),
      shot("e-c1", { category: "editorial", event: "C shoot", date: "2022", caption: "C look" }),
      shot("e-c2", { category: "editorial", event: "C shoot", date: "2022", caption: "C look" }),
      shot("e-c3", { category: "editorial", event: "C shoot", date: "2022", caption: "C look" }),
      shot("e-d1", { category: "editorial", event: "D shoot", date: "2021", caption: "D look" }),
      shot("e-private", { category: "editorial", public: false, event: "E", date: "2020", caption: "E look" }),
    ];
    source.settings = { ...source.settings, heroMediaId: "hero" };
    source.story = [{
      slug: "selected-archive", title: "Selected Work", public: true, sortOrder: 0,
      content: normalizeStoryContent({ mediaIds: ["hero", "r-a1", "e-d1"] }),
    }];
    return source;
  }

  it("never places the same asset twice, and never places the hero again", () => {
    const c = curateHomepage(library(), specs);
    const ids = [c.hero!.id, ...c.selectedWork.map((a) => a.id), ...Object.values(c.galleries).flat().map((a) => a.id)];
    expect(new Set(ids).size).toBe(ids.length);
    expect(c.selectedWork.map((a) => a.id)).not.toContain("hero");
    expect(Object.values(c.galleries).flat().map((a) => a.id)).not.toContain("hero");
  });

  it("caps a run and interleaves shoots instead of printing one set end to end", () => {
    const c = curateHomepage(library(), specs);
    // r-a1 was promoted to Selected Work, so its shoot has one of its two slots left.
    expect(c.galleries.runway.map((a) => a.id)).toEqual(["r-a2", "r-b1"]);
    // C shoot leads, D follows, then C's second frame — a mix, not C C C.
    expect(c.galleries.editorial.map((a) => a.id)).toEqual(["e-c1", "e-c2"]);
  });

  it("respects the limit even when the pool is larger", () => {
    const c = curateHomepage(library(), [{ key: "runway", categories: ["runway"], limit: 2, maxPerShoot: 5 }]);
    expect(c.galleries.runway).toHaveLength(2);
  });

  it("never places a private asset", () => {
    const c = curateHomepage(library(), specs);
    expect(c.placed.has("e-private")).toBe(false);
  });

  it("groups two frames of one look and separates distinct ones", async () => {
    const { mediaShootKey } = await import("../lib/portfolio");
    const a = asset("a", { designer: "D", event: "E", date: "2020", caption: "Studio portrait" });
    const b = asset("b", { designer: "D", event: "E", date: "2020", caption: "Studio portrait" });
    const c = asset("c", { designer: "D", event: "E", date: "2020", caption: "Exterior" });
    expect(mediaShootKey(a)).toBe(mediaShootKey(b));
    expect(mediaShootKey(a)).not.toBe(mediaShootKey(c));
    expect(mediaShootKey(asset("bare"))).toBe("asset:bare");
  });

  it("prefers a designer cover the homepage has not already spent", async () => {
    const { designerCoverAsset } = await import("../lib/portfolio");
    const pool = [asset("shown", { designer: "A", featured: true }), asset("spare", { designer: "A" })];
    expect(designerCoverAsset("A", pool, new Set(["shown"]))?.id).toBe("spare");
    // With every frame already shown, a real image still beats a monogram.
    expect(designerCoverAsset("A", pool, new Set(["shown", "spare"]))?.id).toBe("shown");
  });
});

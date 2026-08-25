import { afterEach, describe, expect, it, vi } from "vitest";
import { readPortfolio, savePortfolio } from "../db/portfolio-repository";
import {
  defaultPortfolio,
  excludeMinorEraAssets,
  isMinorEraAsset,
  isPortfolioData,
  mergeStoryCatalog,
  minorEraAssetIds,
  minorEraPolicy,
  normalizeStory,
  normalizeStoryContent,
  storySectionCatalog,
  storySectionIsEmpty,
  toPublicPortfolio,
  type MediaAsset,
  type PortfolioData,
  type StorySection,
} from "../lib/portfolio";

afterEach(() => vi.unstubAllEnvs());

function asset(id: string, overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id,
    key: `${id}.jpg`,
    url: `/${id}`,
    filename: `${id}.jpg`,
    category: "runway",
    caption: "",
    photographer: "",
    designer: "",
    event: "",
    date: "",
    featured: false,
    public: false,
    minorEra: false,
    focalPoint: "center",
    ...overrides,
  };
}

function section(slug: string, overrides: Partial<StorySection> = {}): StorySection {
  return {
    slug,
    title: slug,
    public: false,
    sortOrder: 0,
    ...overrides,
    content: normalizeStoryContent(overrides.content ?? {}),
  };
}

describe("story content normalization", () => {
  it("coerces untrusted JSONB into a predictable shape without inventing content", () => {
    const result = normalizeStoryContent({ summary: 12, body: null, facts: "nope", mediaIds: ["a", "a", 7, ""], extra: "dropped" });
    expect(result).toEqual({ summary: "", body: "", facts: [], stats: [], mediaIds: ["a"], videoIds: [], creditIds: [] });
    expect(result).not.toHaveProperty("extra");
  });

  it("defaults an unknown fact kind to note and never fabricates values", () => {
    const [fact] = normalizeStoryContent({ facts: [{ kind: "wildcard", label: "Milan" }] }).facts;
    expect(fact.kind).toBe("note");
    expect(fact.label).toBe("Milan");
    expect(fact.value).toBe("");
    expect(fact.year).toBe("");
  });

  it("drops duplicate slugs and orders sections by sortOrder", () => {
    const result = normalizeStory([
      { slug: "b", title: "B", sortOrder: 2, public: false, content: {} },
      { slug: "a", title: "A", sortOrder: 1, public: false, content: {} },
      { slug: "a", title: "Duplicate", sortOrder: 9, public: true, content: {} },
    ]);
    expect(result.map((item) => item.slug)).toEqual(["a", "b"]);
    expect(result[0].title).toBe("A");
    expect(normalizeStory("not an array")).toEqual([]);
  });

  it("merges stored rows over the canonical catalog so Studio never depends on seed state", () => {
    const merged = mergeStoryCatalog([section("about-emma", { public: true, content: { body: "Approved copy" } as never })]);
    expect(merged).toHaveLength(storySectionCatalog.length);
    expect(merged.map((item) => item.slug)).toEqual(storySectionCatalog.map((item) => item.slug));
    const about = merged.find((item) => item.slug === "about-emma");
    expect(about?.content.body).toBe("Approved copy");
    expect(about?.public).toBe(true);
    expect(storySectionIsEmpty(merged.find((item) => item.slug === "dubai")!)).toBe(true);
    expect(storySectionIsEmpty(about!)).toBe(false);
  });

  it("keeps a non-catalog section that already exists in the database", () => {
    const merged = mergeStoryCatalog([section("legacy-chapter")]);
    expect(merged.map((item) => item.slug)).toContain("legacy-chapter");
    expect(merged).toHaveLength(storySectionCatalog.length + 1);
  });

  it("accepts payloads without a story array", () => {
    const legacy = { ...structuredClone(defaultPortfolio) } as Partial<PortfolioData>;
    delete legacy.story;
    expect(isPortfolioData(legacy)).toBe(true);
    expect(isPortfolioData({ ...structuredClone(defaultPortfolio), story: "nope" })).toBe(false);
  });
});

describe("story sanitization boundary", () => {
  function portfolioWithStory(): PortfolioData {
    const source = structuredClone(defaultPortfolio);
    source.media = [asset("public-image", { public: true, featured: true }), asset("private-image")];
    source.videos = [
      { id: "public-video", url: "https://example.com/a.mp4", label: "", designer: "", year: "", primary: true, public: true },
      { id: "private-video", url: "https://example.com/b.mp4", label: "", designer: "", year: "", primary: false, public: false },
    ];
    source.credits = [
      { id: "public-credit", event: "Show", designer: "D", showName: "", city: "", country: "", year: "", venue: "", notes: "", designerBase: "", priority: "standard", verified: true, public: true },
      { id: "private-credit", event: "Show", designer: "D", showName: "", city: "", country: "", year: "", venue: "", notes: "", designerBase: "", priority: "standard", verified: false, public: false },
      { id: "hidden-credit", event: "Show", designer: "D", showName: "", city: "", country: "", year: "", venue: "", notes: "", designerBase: "", priority: "hidden", verified: true, public: true },
    ];
    source.story = [
      section("about-emma", {
        public: true,
        content: {
          summary: "Approved summary",
          body: "Approved body",
          facts: [],
          mediaIds: ["public-image", "private-image"],
          videoIds: ["public-video", "private-video"],
          creditIds: ["public-credit", "private-credit", "hidden-credit"],
        } as never,
      }),
      section("dubai", { public: false, content: { body: "Unapproved draft" } as never }),
    ];
    return source;
  }

  it("omits private sections entirely", () => {
    const result = toPublicPortfolio(portfolioWithStory());
    expect(result.story.map((item) => item.slug)).toEqual(["about-emma"]);
    expect(JSON.stringify(result)).not.toContain("Unapproved draft");
  });

  it("strips references to private media, videos and credits from a public section", () => {
    const [about] = toPublicPortfolio(portfolioWithStory()).story;
    expect(about.content.mediaIds).toEqual(["public-image"]);
    expect(about.content.videoIds).toEqual(["public-video"]);
    expect(about.content.creditIds).toEqual(["public-credit"]);
    expect(about.content.body).toBe("Approved body");
  });

  it("never leaks a private record id through a story reference", () => {
    const serialized = JSON.stringify(toPublicPortfolio(portfolioWithStory()));
    expect(serialized).not.toContain("private-image");
    expect(serialized).not.toContain("private-video");
    expect(serialized).not.toContain("private-credit");
    expect(serialized).not.toContain("hidden-credit");
  });

  it("does not publish a section just because it references public media", () => {
    const source = portfolioWithStory();
    source.story = [section("dubai", { public: false, content: { mediaIds: ["public-image"] } as never })];
    expect(toPublicPortfolio(source).story).toEqual([]);
  });

  it("returns an empty story when none has been entered", () => {
    expect(toPublicPortfolio(structuredClone(defaultPortfolio)).story).toEqual([]);
  });
});

describe("minor-era classification boundary", () => {
  it("identifies and excludes minor-era assets for future analysis pipelines", () => {
    const media = [asset("adult"), asset("early", { minorEra: true })];
    expect(isMinorEraAsset(media[1])).toBe(true);
    expect(isMinorEraAsset(media[0])).toBe(false);
    expect(excludeMinorEraAssets(media).map((item) => item.id)).toEqual(["adult"]);
    expect([...minorEraAssetIds(media)]).toEqual(["early"]);
  });

  it("keeps analysis, matching and automatic publication disallowed by policy", () => {
    expect(minorEraPolicy.allowBiometricAnalysis).toBe(false);
    expect(minorEraPolicy.allowMatchingAndFit).toBe(false);
    expect(minorEraPolicy.allowUnrestrictedInference).toBe(false);
    expect(minorEraPolicy.requiresDeliberatePublication).toBe(true);
  });

  it("does not change publication: the public gate remains the asset's own public flag", () => {
    const source = structuredClone(defaultPortfolio);
    source.media = [asset("early-public", { public: true, featured: true, minorEra: true }), asset("early-private", { minorEra: true })];
    const result = toPublicPortfolio(source);
    expect(result.media.map((item) => item.id)).toEqual(["early-public"]);
    expect(result.media[0].minorEra).toBe(true);
  });
});

describe("story and minor-era persistence", () => {
  it("round-trips story sections and the minor-era flag through the repository adapter", async () => {
    vi.stubEnv("PORTFOLIO_DEMO_MODE", "true");
    vi.stubEnv("NODE_ENV", "test");
    const edited = structuredClone(defaultPortfolio);
    edited.media = [asset("archive", { minorEra: true })];
    edited.story = [section("about-emma", { public: true, content: { body: "Approved body", mediaIds: ["archive"] } as never })];

    await savePortfolio(edited);
    const stored = await readPortfolio();

    expect(stored.story).toHaveLength(1);
    expect(stored.story[0].slug).toBe("about-emma");
    expect(stored.story[0].content.body).toBe("Approved body");
    expect(stored.story[0].content.mediaIds).toEqual(["archive"]);
    expect(stored.media[0].minorEra).toBe(true);
    expect(stored).not.toBe(edited);
  });

  it("persists a section being unpublished", async () => {
    vi.stubEnv("PORTFOLIO_DEMO_MODE", "true");
    vi.stubEnv("NODE_ENV", "test");
    const edited = structuredClone(defaultPortfolio);
    edited.story = [section("about-emma", { public: true, content: { body: "Approved" } as never })];
    await savePortfolio(edited);
    edited.story = [section("about-emma", { public: false, content: { body: "Approved" } as never })];
    await savePortfolio(edited);
    const stored = await readPortfolio();
    expect(stored.story[0].public).toBe(false);
    expect(toPublicPortfolio(stored).story).toEqual([]);
  });
});

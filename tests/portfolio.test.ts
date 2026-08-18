import { describe, expect, it } from "vitest";
import { defaultPortfolio, isPortfolioData, nextHeroMediaId, toPublicPortfolio } from "../lib/portfolio";

describe("portfolio data policy", () => {
  it("filters private records and replaces an inaccessible hero", () => {
    const source = structuredClone(defaultPortfolio);
    source.profile.bookingContact = "Private Manager";
    source.profile.citizenship = "Private citizenship";
    source.profile.instagram = "https://instagram.com/private";
    source.profile.tiktok = "https://tiktok.com/@private";
    source.profile.visibility.instagram = false;
    source.settings.heroMediaId = "private";
    source.media = [
      { id: "private", key: "private.jpg", url: "/private", filename: "private.jpg", category: "runway", caption: "", photographer: "", designer: "", event: "", date: "", featured: false, public: false, focalPoint: "center" },
      { id: "public", key: "public.jpg", url: "/public", filename: "public.jpg", category: "runway", caption: "", photographer: "", designer: "", event: "", date: "", featured: true, public: true, focalPoint: "center" },
    ];
    source.credits = [
      { id: "hidden", event: "", designer: "", showName: "", city: "", country: "", year: "", venue: "", notes: "", designerBase: "", priority: "hidden", verified: false, public: true },
      { id: "visible", event: "Show", designer: "Designer", showName: "", city: "", country: "", year: "2026", venue: "Internal venue", notes: "Internal note", designerBase: "Internal base", priority: "standard", verified: true, public: true },
    ];

    const result = toPublicPortfolio(source);
    expect(result.media.map((asset) => asset.id)).toEqual(["public"]);
    expect(result.settings.heroMediaId).toBe("public");
    expect(result.credits).toHaveLength(1);
    expect(result.credits[0]).toMatchObject({ id: "visible", venue: "", notes: "", designerBase: "" });
    expect(result.profile.bookingContact).toBe("");
    expect(result.profile.citizenship).toBe("");
    expect(result.profile.instagram).toBe("");
    expect(result.profile.tiktok).toBe("");
  });

  it("rejects malformed API payloads", () => {
    expect(isPortfolioData(defaultPortfolio)).toBe(true);
    expect(isPortfolioData({ profile: {}, credits: [], media: [], videos: [], settings: {} })).toBe(false);
  });

  it("toggles explicit hero selection without auto-assigning another asset", () => {
    expect(nextHeroMediaId("", "one")).toBe("one");
    expect(nextHeroMediaId("one", "two")).toBe("two");
    expect(nextHeroMediaId("two", "two")).toBe("");
  });

  it("keeps an empty explicit hero empty and uses featured only as public fallback", () => {
    const source = structuredClone(defaultPortfolio);
    source.settings.heroMediaId = "";
    source.media = [
      { id: "previous", key: "previous.jpg", url: "/previous", filename: "previous.jpg", category: "runway", caption: "", photographer: "", designer: "", event: "", date: "", featured: false, public: true, focalPoint: "center" },
      { id: "featured", key: "featured.jpg", url: "/featured", filename: "featured.jpg", category: "runway", caption: "", photographer: "", designer: "", event: "", date: "", featured: true, public: true, focalPoint: "center" },
    ];

    expect(toPublicPortfolio(source).settings.heroMediaId).toBe("featured");

    source.media = source.media.map((asset) => ({ ...asset, featured: false }));
    expect(toPublicPortfolio(source).settings.heroMediaId).toBe("");
  });
});

/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PublicPortfolio } from "../app/components/PublicPortfolio";
import {
  defaultPortfolio,
  normalizeStoryContent,
  publicStoryStats,
  storyParagraphs,
  storySectionMedia,
  toPublicPortfolio,
  type MediaAsset,
  type PortfolioData,
  type StorySection,
} from "../lib/portfolio";

afterEach(cleanup);

function asset(id: string, overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id, key: `${id}.jpg`, url: `/${id}`, filename: `${id}.jpg`, category: "runway",
    caption: "", photographer: "", designer: "", event: "", date: "",
    featured: false, public: true, minorEra: false, focalPoint: "center", ...overrides,
  };
}

function section(slug: string, overrides: Partial<StorySection> = {}): StorySection {
  return {
    slug, title: slug, public: true, sortOrder: 0, ...overrides,
    content: normalizeStoryContent(overrides.content ?? {}),
  };
}

describe("experience figures", () => {
  it("normalizes stats and caps the list at eight", () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ id: `s${i}`, value: `${i}`, label: "x" }));
    expect(normalizeStoryContent({ stats: many }).stats).toHaveLength(8);
    expect(normalizeStoryContent({ stats: "nope" }).stats).toEqual([]);
    expect(normalizeStoryContent({ stats: [{ value: 18 }] }).stats[0]).toMatchObject({ value: "", label: "" });
  });

  it("reads stats from the first public section that carries them", () => {
    const story = [
      section("modeling-journey"),
      section("about-emma", { content: { stats: [{ id: "a", value: "18", label: "Years modeling" }] } as never }),
    ];
    expect(publicStoryStats(story)[0].value).toBe("18");
    expect(publicStoryStats([section("dubai")])).toEqual([]);
  });

  it("renders the experience strip only when stats exist", () => {
    const base = structuredClone(defaultPortfolio);
    render(<PublicPortfolio initialData={base} />);
    expect(screen.queryByText("Years modeling")).toBeNull();
    cleanup();

    const withStats: PortfolioData = {
      ...base,
      story: [section("about-emma", { content: { stats: [{ id: "a", value: "18", label: "Years modeling" }] } as never })],
    };
    render(<PublicPortfolio initialData={withStats} />);
    const strip = document.querySelector(".experience-grid");
    expect(strip).toBeTruthy();
    expect(strip!.textContent).toContain("18");
    expect(strip!.textContent).toContain("Years modeling");
    // the hero also surfaces the leading figure
    expect(document.querySelector(".hero-stat")?.textContent).toContain("18");
  });
});

describe("story-driven public sections", () => {
  it("splits narrative bodies on blank lines", () => {
    expect(storyParagraphs("one\n\ntwo\n\n\nthree")).toEqual(["one", "two", "three"]);
    expect(storyParagraphs("")).toEqual([]);
  });

  it("renders Her Story from the modeling-journey section", () => {
    const data: PortfolioData = {
      ...structuredClone(defaultPortfolio),
      story: [section("modeling-journey", { title: "Her story", content: { body: "Approved beat one.\n\nApproved beat two." } as never })],
    };
    render(<PublicPortfolio initialData={data} />);
    expect(screen.getByText("Approved beat one.")).toBeTruthy();
    expect(screen.getByText("Approved beat two.")).toBeTruthy();
  });

  it("renders the career timeline only from milestone/show/location facts", () => {
    const data: PortfolioData = {
      ...structuredClone(defaultPortfolio),
      story: [section("modeling-journey", {
        content: {
          facts: [
            { id: "f1", kind: "show", label: "Paris Fashion Week", value: "In-person participation", year: "March 2019", location: "Paris, France" },
            { id: "f2", kind: "note", label: "Internal note", value: "should not render", year: "", location: "" },
          ],
        } as never,
      })],
    };
    render(<PublicPortfolio initialData={data} />);
    expect(screen.getByText("Paris Fashion Week")).toBeTruthy();
    expect(screen.getByText("In-person participation")).toBeTruthy();
    expect(screen.queryByText("Internal note")).toBeNull();
  });

  it("omits every new section when no story content exists", () => {
    render(<PublicPortfolio initialData={structuredClone(defaultPortfolio)} />);
    for (const heading of ["Her story", "Selected work", "Beyond the runway", "Professional approach"]) {
      expect(screen.queryByText(heading)).toBeNull();
    }
  });
});

describe("story sections respect the privacy boundary", () => {
  it("never resolves a private media reference into a public section", () => {
    const source = structuredClone(defaultPortfolio);
    source.media = [asset("public-shot"), asset("private-shot", { public: false })];
    source.story = [section("selected-archive", { content: { mediaIds: ["public-shot", "private-shot"] } as never })];

    const publicData = toPublicPortfolio(source);
    const resolved = storySectionMedia(publicData.story[0], publicData.media);
    expect(resolved.map((a) => a.id)).toEqual(["public-shot"]);

    render(<PublicPortfolio initialData={publicData} />);
    expect(document.body.innerHTML).not.toContain("private-shot");
  });

  it("does not render a private story section", () => {
    const source = structuredClone(defaultPortfolio);
    source.story = [section("modeling-journey", { public: false, content: { body: "Unapproved draft copy." } as never })];
    const publicData = toPublicPortfolio(source);
    render(<PublicPortfolio initialData={publicData} />);
    expect(document.body.innerHTML).not.toContain("Unapproved draft copy.");
  });
});

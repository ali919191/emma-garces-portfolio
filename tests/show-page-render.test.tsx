/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { defaultPortfolio, type PortfolioData } from "../lib/portfolio";

const data: PortfolioData = {
  ...structuredClone(defaultPortfolio),
  credits: [{ id: "c1", event: "Houston Fashion Week", designer: "Mysterious by N.P.N.", showName: "The Grid Show", city: "Houston", country: "USA", year: "June 2025", venue: "", notes: "", designerBase: "", priority: "standard", verified: true, public: true }],
  media: [{ id: "m1", key: "portfolio/2026/npn-02.jpg", url: "", filename: "npn-02.jpg", category: "runway", caption: "Couture gown, The Grid Show", photographer: "", designer: "Mysterious by N.P.N.", event: "Houston Fashion Week", date: "June 2025", featured: true, public: true, minorEra: false, focalPoint: "top" }],
  videos: [{ id: "v1", url: "https://blob.example/grid.mp4", label: "The Grid Show", designer: "Mysterious by N.P.N.", year: "June 2025", primary: true, public: true }],
};

vi.mock("../db/portfolio-repository", () => ({ readPortfolio: async () => data }));

describe("show detail page", () => {
  it("renders the show, its footage and back navigation", async () => {
    const { default: ShowPage } = await import("../app/shows/[id]/page");
    const html = renderToStaticMarkup(await ShowPage({ params: Promise.resolve({ id: "c1" }) }) as React.ReactElement);
    expect(html).toContain("Mysterious by N.P.N.");
    expect(html).toContain("The Grid Show");
    expect(html).toContain("Houston, USA");
    expect(html).toContain("Back to selected runway");
    expect(html).toContain('href="/#credits"');
    expect(html).toContain("/api/media?key=portfolio%2F2026%2Fnpn-02.jpg");
    expect(html).toContain("blob.example/grid.mp4");
  });

  it("404s a credit with nothing attached", async () => {
    const { default: ShowPage } = await import("../app/shows/[id]/page");
    await expect(ShowPage({ params: Promise.resolve({ id: "missing" }) })).rejects.toThrow();
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PublicPortfolio } from "../app/components/PublicPortfolio";
import { defaultPortfolio, toPublicPortfolio } from "../lib/portfolio";

describe("public portfolio rendering", () => {
  it("renders the public identity without leaking hidden profile fields", () => {
    const source = structuredClone(defaultPortfolio);
    source.profile.email = "private@example.com";
    source.profile.phone = "+1 555 0100";
    source.profile.visibility.email = false;
    source.profile.visibility.phone = false;

    const html = renderToStaticMarkup(<PublicPortfolio initialData={toPublicPortfolio(source)} />);

    expect(html).toContain("Emma Garces");
    expect(html).toContain("International Runway Model");
    expect(html).not.toContain("private@example.com");
    expect(html).not.toContain("+1 555 0100");
  });

  it("falls back to a featured public image when the explicit hero is cleared", () => {
    const source = structuredClone(defaultPortfolio);
    source.settings.heroMediaId = "";
    source.media = [
      { id: "featured", key: "featured.jpg", url: "/featured.jpg", filename: "featured.jpg", category: "runway", caption: "Featured runway look", photographer: "", designer: "", event: "", date: "", featured: true, public: true, focalPoint: "center" },
    ];

    const html = renderToStaticMarkup(<PublicPortfolio initialData={toPublicPortfolio(source)} />);
    expect(html).toContain("hero has-image");
    expect(html).toContain('src="/api/media?key=featured.jpg"');
    expect(html).not.toContain("hero-monogram");
    expect(JSON.stringify(toPublicPortfolio(source).media)).not.toContain("/api/media");
  });

  it("shows the monogram placeholder when no explicit hero or featured public image exists", () => {
    const source = structuredClone(defaultPortfolio);
    source.settings.heroMediaId = "";
    source.media = [
      { id: "plain", key: "plain.jpg", url: "/plain.jpg", filename: "plain.jpg", category: "runway", caption: "", photographer: "", designer: "", event: "", date: "", featured: false, public: true, focalPoint: "center" },
    ];

    const html = renderToStaticMarkup(<PublicPortfolio initialData={toPublicPortfolio(source)} />);
    expect(html).toContain("hero editorial-placeholder");
    expect(html).toContain("hero-monogram");
    expect(html).not.toContain("hero-image");
    expect(html).not.toMatch(/\/api\/media\?key=[^"']*\\/);
  });
});

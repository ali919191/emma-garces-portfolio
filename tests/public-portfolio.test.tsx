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
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { readPortfolio, savePortfolio } from "../db/portfolio-repository";
import { defaultPortfolio } from "../lib/portfolio";

afterEach(() => vi.unstubAllEnvs());

describe("portfolio repository persistence contract", () => {
  it("round-trips edits through the development repository adapter", async () => {
    vi.stubEnv("PORTFOLIO_DEMO_MODE", "true");
    vi.stubEnv("NODE_ENV", "test");
    const edited = structuredClone(defaultPortfolio);
    edited.profile.bio = "Runway model available for international bookings.";
    edited.settings.lastPublishedAt = "2026-08-18T12:00:00.000Z";

    await savePortfolio(edited);
    const stored = await readPortfolio();

    expect(stored).toEqual(edited);
    expect(stored).not.toBe(edited);
  });

  it("persists an unset hero as an empty heroMediaId", async () => {
    vi.stubEnv("PORTFOLIO_DEMO_MODE", "true");
    vi.stubEnv("NODE_ENV", "test");
    const edited = structuredClone(defaultPortfolio);
    edited.settings.heroMediaId = "asset-1";
    await savePortfolio(edited);
    edited.settings.heroMediaId = "";
    await savePortfolio(edited);
    const stored = await readPortfolio();
    expect(stored.settings.heroMediaId).toBe("");
  });
});

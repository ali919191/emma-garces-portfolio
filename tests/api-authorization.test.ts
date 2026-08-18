import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/auth", () => ({ requireAdminApi: vi.fn(async () => false) }));

describe("portfolio mutation API", () => {
  beforeEach(() => vi.resetModules());

  it("rejects an unauthenticated write before parsing the body", async () => {
    const { PUT } = await import("../app/api/portfolio/route");
    const response = await PUT(new Request("http://localhost/api/portfolio", { method: "PUT", body: "not-json" }));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Authentication required." });
  });
});

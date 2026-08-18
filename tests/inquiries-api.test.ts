import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/auth", () => ({ requireAdminApi: vi.fn(async () => false) }));

describe("inquiry API authorization", () => {
  beforeEach(() => vi.resetModules());

  it("rejects unauthenticated inquiry listing", async () => {
    const { GET } = await import("../app/api/inquiries/route");
    const response = await GET();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Authentication required." });
  });

  it("rejects unauthenticated inquiry status changes", async () => {
    const { PATCH } = await import("../app/api/inquiries/[id]/route");
    const response = await PATCH(new Request("http://localhost/api/inquiries/1", { method: "PATCH", body: "{}" }), { params: Promise.resolve({ id: "1" }) });
    expect(response.status).toBe(401);
  });
});

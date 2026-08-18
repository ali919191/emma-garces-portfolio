import { afterEach, describe, expect, it, vi } from "vitest";
import { adminEmails, allowlistedEmailFrom, isAdminEmail } from "../lib/auth";

afterEach(() => vi.unstubAllEnvs());

describe("administrator allowlist", () => {
  it("normalizes and enforces the configured email list", () => {
    vi.stubEnv("ADMIN_EMAIL", " Emma@Example.com , second@example.com ");
    expect(adminEmails()).toEqual(["emma@example.com", "second@example.com"]);
    expect(isAdminEmail("EMMA@example.com")).toBe(true);
    expect(isAdminEmail("stranger@example.com")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(allowlistedEmailFrom([null, "other@example.com", "emma@example.com"])).toBe("emma@example.com");
    expect(allowlistedEmailFrom([null, "hidden@users.noreply.github.com"])).toBeNull();
  });
});

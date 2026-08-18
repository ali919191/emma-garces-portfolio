import { describe, expect, it } from "vitest";
import { canReadMedia, isValidMediaKey } from "../lib/media-access";

describe("media authorization", () => {
  it("allows public media and restricts private media to an administrator", () => {
    expect(canReadMedia(true, false)).toBe(true);
    expect(canReadMedia(false, true)).toBe(true);
    expect(canReadMedia(false, false)).toBe(false);
  });

  it("rejects media keys that would produce malformed /api/media URLs", () => {
    expect(isValidMediaKey("portfolio/look.jpeg")).toBe(true);
    expect(isValidMediaKey("")).toBe(false);
    expect(isValidMediaKey("portfolio/look.jpeg\\")).toBe(false);
    expect(isValidMediaKey("portfolio/look.jpeg\"")).toBe(false);
    expect(isValidMediaKey("portfolio/<script>.jpeg")).toBe(false);
  });
});

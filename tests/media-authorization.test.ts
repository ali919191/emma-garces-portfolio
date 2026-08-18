import { describe, expect, it } from "vitest";
import { canReadMedia } from "../lib/media-access";

describe("media authorization", () => {
  it("allows public media and restricts private media to an administrator", () => {
    expect(canReadMedia(true, false)).toBe(true);
    expect(canReadMedia(false, true)).toBe(true);
    expect(canReadMedia(false, false)).toBe(false);
  });
});

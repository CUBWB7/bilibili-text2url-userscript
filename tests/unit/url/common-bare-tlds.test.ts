import { describe, expect, it } from "vitest";
import { COMMON_BARE_TLDS } from "../../../src/core/url/common-bare-tlds";

describe("COMMON_BARE_TLDS", () => {
  it("contains the maintained common bare-domain suffixes", () => {
    expect(COMMON_BARE_TLDS.has("com")).toBe(true);
    expect(COMMON_BARE_TLDS.has("cn")).toBe(true);
    expect(COMMON_BARE_TLDS.has("top")).toBe(true);
    expect(COMMON_BARE_TLDS.has("xyz")).toBe(true);
    expect(COMMON_BARE_TLDS.has("md")).toBe(false);
  });
});

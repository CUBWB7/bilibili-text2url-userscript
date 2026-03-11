import { describe, expect, it } from "vitest";
import { normalizeUrl } from "../../../src/core/url/normalize-url";

describe("normalizeUrl", () => {
  it("prepends https to bare domains", () => {
    expect(normalizeUrl("modeltest.codermumu.top")).toBe("https://modeltest.codermumu.top/");
  });

  it("keeps protocol urls", () => {
    expect(normalizeUrl("https://example.com/path")).toBe("https://example.com/path");
  });

  it("trims sentence punctuation", () => {
    expect(normalizeUrl("https://example.com。")).toBe("https://example.com/");
  });

  it("rejects numeric decimals", () => {
    expect(normalizeUrl("1.2")).toBeNull();
  });
});

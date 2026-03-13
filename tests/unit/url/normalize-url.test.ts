import { describe, expect, it } from "vitest";
import { normalizeUrl } from "../../../src/core/url/normalize-url";

describe("normalizeUrl", () => {
  it("prepends https to bare domains", () => {
    expect(normalizeUrl("modeltest.codermumu.top")).toBe("https://modeltest.codermumu.top/");
  });

  it("rejects bare domains outside the common tld allowlist", () => {
    expect(normalizeUrl("soul.md")).toBeNull();
  });

  it("rejects bare domains whose tld is not in the allowlist", () => {
    expect(normalizeUrl("project.online")).toBeNull();
  });

  it("keeps protocol urls", () => {
    expect(normalizeUrl("https://example.com/path")).toBe("https://example.com/path");
  });

  it("keeps explicit protocol urls even when the tld is outside the allowlist", () => {
    expect(normalizeUrl("https://soul.md")).toBe("https://soul.md/");
  });

  it("keeps explicit-looking bare urls even when the tld is outside the allowlist", () => {
    expect(normalizeUrl("www.soul.md/docs")).toBe("https://www.soul.md/docs");
  });

  it("trims sentence punctuation", () => {
    expect(normalizeUrl("https://example.com。")).toBe("https://example.com/");
  });

  it("rejects numeric decimals", () => {
    expect(normalizeUrl("1.2")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { getBilibiliPageType, isSupportedBilibiliPage } from "../../../../src/site/bilibili/page-type";

describe("getBilibiliPageType", () => {
  it("treats watchlater pages as video pages", () => {
    expect(
      getBilibiliPageType({
        hostname: "www.bilibili.com",
        pathname: "/list/watchlater/"
      })
    ).toBe("video");
  });

  it("keeps unrelated bilibili list pages unsupported", () => {
    expect(
      getBilibiliPageType({
        hostname: "www.bilibili.com",
        pathname: "/list/ml123456"
      })
    ).toBe("unsupported");
  });
});

describe("isSupportedBilibiliPage", () => {
  it("returns true for watchlater pages", () => {
    expect(
      isSupportedBilibiliPage({
        hostname: "www.bilibili.com",
        pathname: "/list/watchlater/"
      })
    ).toBe(true);
  });
});

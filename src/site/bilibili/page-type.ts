export type BilibiliPageType = "video" | "dynamic" | "unsupported";

export function getBilibiliPageType(locationLike: Pick<Location, "hostname" | "pathname">): BilibiliPageType {
  if (locationLike.hostname === "www.bilibili.com" && locationLike.pathname.startsWith("/video/")) {
    return "video";
  }

  if (locationLike.hostname === "t.bilibili.com" || locationLike.pathname.startsWith("/opus/")) {
    return "dynamic";
  }

  return "unsupported";
}

export function isSupportedBilibiliPage(locationLike: Pick<Location, "hostname" | "pathname">): boolean {
  return getBilibiliPageType(locationLike) !== "unsupported";
}

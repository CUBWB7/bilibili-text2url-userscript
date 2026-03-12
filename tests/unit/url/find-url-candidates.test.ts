import { describe, expect, it } from "vitest";
import { findUrlCandidates } from "../../../src/core/url/find-url-candidates";

describe("findUrlCandidates", () => {
  it("matches protocol urls", () => {
    const matches = findUrlCandidates("go to https://example.com now");
    expect(matches.map((match) => match.displayText)).toEqual(["https://example.com"]);
  });

  it("matches bare domains with paths", () => {
    const matches = findUrlCandidates("visit modeltest.codermumu.top/test?a=1");
    expect(matches.map((match) => match.displayText)).toEqual(["modeltest.codermumu.top/test?a=1"]);
  });

  it("rejects dotted decimals", () => {
    expect(findUrlCandidates("播放量 1.2万")).toEqual([]);
  });

  it("does not match email domains", () => {
    expect(findUrlCandidates("mail me at dev@example.com")).toEqual([]);
  });

  it("stops before chinese file tags after a url", () => {
    const matches = findUrlCandidates(
      "https://www.kdocs.cn/l/cd8zue8rZ5sD?f=301【文件】 模型的范式变迁.docx"
    );

    expect(matches.map((match) => match.displayText)).toEqual([
      "https://www.kdocs.cn/l/cd8zue8rZ5sD?f=301"
    ]);
  });
});
